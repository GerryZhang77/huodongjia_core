/**
 * UserPoolPage - 商家用户池管理页面
 *
 * 核心功能：
 * 1. 我的用户：商家私域用户池（总库 + 分库）
 * 2. 发现用户：平台公开用户池（付费解锁 + 邀请 + 收藏）
 * 3. 多维度筛选（性别/年龄/行业/标签/活跃度）
 * 4. 搜索
 * 5. 批量打标签、批量推送活动
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Tag as TagIcon,
  Send,
  Users,
  UserCheck,
  TrendingUp,
  Activity,
  X,
  Settings,
} from "lucide-react";
import { Toast } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";
import {
  UserCard,
  UserPoolFilterDrawer,
  ActivitySelector,
  UserDetailDrawer,
  BatchTagModal,
  PushActivityModal,
  CustomTagManager,
  UserPoolTabs,
  QuotaIndicator,
  DiscoveryUserCard,
  DiscoveryFilterBar,
  UnlockConfirmModal,
  DiscoveryUserDetail,
  InviteActivityModal,
} from "@/features/merchant/user-pool/components";
import type { PushActivityOption } from "@/features/merchant/user-pool/components";
import type { InviteActivityOption } from "@/features/merchant/user-pool/components";
import type {
  MerchantUser,
  UserPoolFilterCriteria,
  CustomTag,
  UserPoolTab,
  PlatformUser,
  DiscoveryFilterCriteria,
  DiscoveryQuota,
} from "@/features/merchant/user-pool/types";
import {
  DEFAULT_USER_POOL_FILTER,
  DEFAULT_DISCOVERY_FILTER,
} from "@/features/merchant/user-pool/types";
import {
  calculateUserPoolFilterOptions,
  applyUserPoolFilters,
  getActiveFilterCount,
} from "@/features/merchant/user-pool/utils";
import {
  mockMerchantUsers,
  getMerchantUserPoolStats,
  getUsersByActivityId,
  customTagsMap,
} from "@/mocks/data/merchant-users";
import { mockMerchantActivities } from "@/mocks/data/merchant";
import {
  mockPlatformUsers,
  mockDiscoveryQuota,
  getDiscoveryFilterOptions,
  applyDiscoveryFilters,
  unlockPlatformUser,
  toggleFavoritePlatformUser,
} from "@/mocks/data/platform-users";
import type { ActivityOption } from "@/features/merchant/user-pool/components/ActivitySelector";

// ========================================
// 统计卡片组件
// ========================================

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}
    >
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

// ========================================
// 主页面组件
// ========================================

const UserPoolPage: React.FC = () => {
  // ========================================
  // 顶层 Tab 状态
  // ========================================
  const [activeTab, setActiveTab] = useState<UserPoolTab>("my-users");

  // ========================================
  // 「我的用户」状态
  // ========================================
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<UserPoolFilterCriteria>({
    ...DEFAULT_USER_POOL_FILTER,
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [detailUser, setDetailUser] = useState<MerchantUser | null>(null);
  const [batchTagVisible, setBatchTagVisible] = useState(false);
  const [pushActivityVisible, setPushActivityVisible] = useState(false);
  const [tagManagerVisible, setTagManagerVisible] = useState(false);
  const [customTags, setCustomTags] = useState<CustomTag[]>(() => {
    const tagCountMap = new Map<string, number>();
    Object.values(customTagsMap).forEach((tags) => {
      tags.forEach((tagName) => {
        tagCountMap.set(tagName, (tagCountMap.get(tagName) || 0) + 1);
      });
    });
    const colorKeys = [
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "error",
    ];
    return Array.from(tagCountMap.entries()).map(([name, count], idx) => ({
      id: `tag_${idx + 1}`,
      name,
      color: colorKeys[idx % colorKeys.length],
      createdAt: new Date().toISOString(),
      userCount: count,
    }));
  });

  // ========================================
  // 「发现用户」状态
  // ========================================
  const [platformUsers, setPlatformUsers] =
    useState<PlatformUser[]>(mockPlatformUsers);
  const [discoveryQuota, setDiscoveryQuota] =
    useState<DiscoveryQuota>(mockDiscoveryQuota);
  const [discoveryFilter, setDiscoveryFilter] =
    useState<DiscoveryFilterCriteria>({ ...DEFAULT_DISCOVERY_FILTER });
  const [discoveryDetailUser, setDiscoveryDetailUser] =
    useState<PlatformUser | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<PlatformUser | null>(null);
  const [inviteTarget, setInviteTarget] = useState<PlatformUser | null>(null);

  // ---- 数据 ----

  // 根据选中的活动切换数据源
  const users: MerchantUser[] = useMemo(() => {
    if (selectedActivityId === null) {
      return mockMerchantUsers;
    }
    return getUsersByActivityId(selectedActivityId);
  }, [selectedActivityId]);

  // 应用搜索 + 筛选
  const filteredUsers = useMemo(() => {
    // 先搜索
    let result = users;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(kw) ||
          (u.industry && u.industry.toLowerCase().includes(kw)) ||
          (u.city && u.city.toLowerCase().includes(kw)) ||
          (u.company && u.company.toLowerCase().includes(kw)) ||
          u.autoTags.some((t) => t.toLowerCase().includes(kw)) ||
          u.customTags.some((t) => t.toLowerCase().includes(kw)),
      );
    }
    // 再筛选
    return applyUserPoolFilters(result, filterCriteria);
  }, [users, searchKeyword, filterCriteria]);

  // 筛选选项
  const filterOptions = useMemo(
    () => calculateUserPoolFilterOptions(users),
    [users],
  );

  // 统计数据
  const stats = useMemo(() => getMerchantUserPoolStats(), []);

  // 活跃筛选数
  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filterCriteria),
    [filterCriteria],
  );

  // 活动选项列表
  const activityOptions: ActivityOption[] = useMemo(
    () =>
      mockMerchantActivities.map((a) => ({
        id: a.id,
        title: a.title,
        participantCount: a.currentParticipants,
        status: a.status,
      })),
    [],
  );

  // 推送活动选项列表
  const pushActivityOptions: PushActivityOption[] = useMemo(
    () =>
      mockMerchantActivities.map((a) => ({
        id: a.id,
        title: a.title,
        startTime: a.eventStartTime,
        location: a.location || "",
        participantCount: a.currentParticipants,
        maxParticipants: a.maxParticipants,
        status: a.status,
      })),
    [],
  );

  // ---- 发现用户数据派生 ----
  const discoveryFilterOptions = useMemo(
    () => getDiscoveryFilterOptions(platformUsers),
    [platformUsers],
  );

  const filteredPlatformUsers = useMemo(
    () => applyDiscoveryFilters(platformUsers, discoveryFilter),
    [platformUsers, discoveryFilter],
  );

  // 推送/邀请活动选项（复用）
  const inviteActivityOptions: InviteActivityOption[] = useMemo(
    () =>
      mockMerchantActivities.map((a) => ({
        id: a.id,
        title: a.title,
        startTime: a.eventStartTime,
        location: a.location || "",
        participantCount: a.currentParticipants,
        maxParticipants: a.maxParticipants,
        status: a.status,
      })),
    [],
  );

  // ---- 操作 ----

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  }, [filteredUsers, selectedUserIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedUserIds(new Set());
  }, []);

  const handleBatchTag = useCallback(() => {
    if (selectedUserIds.size === 0) {
      Toast.show({ content: "请先选择用户", position: "bottom" });
      return;
    }
    setBatchTagVisible(true);
  }, [selectedUserIds.size]);

  const handleBatchPush = useCallback(() => {
    if (selectedUserIds.size === 0) {
      Toast.show({ content: "请先选择用户", position: "bottom" });
      return;
    }
    setPushActivityVisible(true);
  }, [selectedUserIds.size]);

  const handleClearFilters = useCallback(() => {
    setFilterCriteria({ ...DEFAULT_USER_POOL_FILTER });
    setSearchKeyword("");
  }, []);

  const handleActivityChange = useCallback((activityId: string | null) => {
    setSelectedActivityId(activityId);
    // 切换活动时清空选择和筛选
    setSelectedUserIds(new Set());
    setFilterCriteria({ ...DEFAULT_USER_POOL_FILTER });
    setSearchKeyword("");
  }, []);

  // 批量打标签确认
  const handleBatchTagConfirm = useCallback(
    (tagNames: string[]) => {
      // TODO: 调用 API 批量打标签
      Toast.show({
        content: `已为 ${selectedUserIds.size} 位用户添加 ${tagNames.length} 个标签`,
        position: "bottom",
      });
      setBatchTagVisible(false);
      setSelectedUserIds(new Set());
    },
    [selectedUserIds.size],
  );

  // 推送活动确认
  const handlePushConfirm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_params: { activityId: string; message: string; channels: string[] }) => {
      // TODO: 调用 API 推送活动
      Toast.show({
        content: `已向 ${selectedUserIds.size} 位用户推送活动邀请`,
        position: "bottom",
      });
      setPushActivityVisible(false);
      setSelectedUserIds(new Set());
    },
    [selectedUserIds.size],
  );

  // 创建自定义标签
  const handleCreateTag = useCallback((name: string, color: string) => {
    const newTag: CustomTag = {
      id: `tag_${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString(),
      userCount: 0,
    };
    setCustomTags((prev) => [...prev, newTag]);
  }, []);

  // 删除自定义标签
  const handleDeleteTag = useCallback((tagId: string) => {
    setCustomTags((prev) => prev.filter((t) => t.id !== tagId));
  }, []);

  // ========================================
  // 发现用户操作
  // ========================================

  // 解锁用户
  const handleUnlockConfirm = useCallback(
    (userId: string) => {
      const updated = unlockPlatformUser(userId);
      if (updated) {
        setPlatformUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isUnlocked: true } : u)),
        );
        setDiscoveryQuota((prev) => ({
          ...prev,
          usedUnlocks: prev.usedUnlocks + 1,
        }));
        Toast.show({ content: "解锁成功，可查看完整信息", position: "bottom" });
        // 如果当前查看的是这个用户的详情，更新
        if (discoveryDetailUser?.id === userId) {
          setDiscoveryDetailUser((prev) =>
            prev ? { ...prev, isUnlocked: true } : null,
          );
        }
      }
      setUnlockTarget(null);
    },
    [discoveryDetailUser],
  );

  // 收藏/取消收藏
  const handleToggleFavorite = useCallback(
    (userId: string) => {
      toggleFavoritePlatformUser(userId);
      setPlatformUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFavorited: !u.isFavorited } : u,
        ),
      );
      // 同步详情弹窗
      if (discoveryDetailUser?.id === userId) {
        setDiscoveryDetailUser((prev) =>
          prev ? { ...prev, isFavorited: !prev.isFavorited } : null,
        );
      }
    },
    [discoveryDetailUser],
  );

  // 邀请用户参加活动
  const handleInviteConfirm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_params: { userId: string; activityId: string; message: string }) => {
      Toast.show({ content: "邀请已发送", position: "bottom" });
      setInviteTarget(null);
    },
    [],
  );

  // 从详情弹窗触发解锁
  const handleDetailUnlock = useCallback(
    (userId: string) => {
      const user = platformUsers.find((u) => u.id === userId) || null;
      setUnlockTarget(user);
    },
    [platformUsers],
  );

  // 从详情弹窗触发邀请
  const handleDetailInvite = useCallback(
    (userId: string) => {
      const user = platformUsers.find((u) => u.id === userId) || null;
      setInviteTarget(user);
    },
    [platformUsers],
  );

  // 是否全选
  const isAllSelected =
    filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length;

  return (
    <MerchantLayout title="用户管理" showBack={false}>
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Tab 切换：我的用户 / 发现用户 */}
        <UserPoolTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          myUserCount={mockMerchantUsers.length}
          platformUserCount={platformUsers.length}
        />

        {/* ============================================ */}
        {/* 「我的用户」视图 */}
        {/* ============================================ */}
        {activeTab === "my-users" && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="总用户数"
                value={stats.totalUsers}
                icon={Users}
                iconColor="text-primary-400"
                bgColor="bg-primary-50"
              />
              <StatCard
                label="活跃用户"
                value={stats.activeUsers}
                icon={UserCheck}
                iconColor="text-green-500"
                bgColor="bg-green-50"
              />
              <StatCard
                label="本月新增"
                value={stats.newUsersThisMonth}
                icon={TrendingUp}
                iconColor="text-orange-500"
                bgColor="bg-orange-50"
              />
              <StatCard
                label="人均参与"
                value={`${stats.avgParticipation}次`}
                icon={Activity}
                iconColor="text-purple-500"
                bgColor="bg-purple-50"
              />
            </div>

            {/* 活动选择器 + 搜索 + 筛选 */}
            <div className="space-y-3">
              <ActivitySelector
                selectedActivityId={selectedActivityId}
                activities={activityOptions}
                totalUserCount={mockMerchantUsers.length}
                onSelect={handleActivityChange}
              />
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    placeholder="搜索姓名、行业、城市、标签..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  {searchKeyword && (
                    <button onClick={() => setSearchKeyword("")}>
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors flex-shrink-0 ${
                    activeFilterCount > 0
                      ? "border-primary-400 bg-primary-50 text-primary-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setFilterVisible(true)}
                >
                  <Filter size={16} />
                  筛选
                  {activeFilterCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary-400 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 transition-colors flex-shrink-0"
                  onClick={() => setTagManagerVisible(true)}
                >
                  <Settings size={16} />
                  标签
                </button>
              </div>
            </div>

            {/* 操作栏：全选/批量操作 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                  onClick={handleSelectAll}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isAllSelected
                        ? "bg-primary-400 border-primary-400"
                        : "border-gray-300"
                    }`}
                  >
                    {isAllSelected && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        className="text-white"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {isAllSelected ? "取消全选" : "全选"}
                </button>
                <span className="text-sm text-gray-400">
                  共 {filteredUsers.length} 人
                  {filteredUsers.length !== users.length && (
                    <span>
                      {" "}
                      (已筛选,{" "}
                      <button
                        className="text-primary-400 hover:underline"
                        onClick={handleClearFilters}
                      >
                        清除
                      </button>
                      )
                    </span>
                  )}
                </span>
              </div>
              {selectedUserIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-400 font-medium">
                    已选 {selectedUserIds.size} 人
                  </span>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[22px] bg-accent-50 text-accent-600 text-sm font-medium hover:bg-accent-100 transition-colors"
                    onClick={handleBatchTag}
                  >
                    <TagIcon size={14} />
                    打标签
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    onClick={handleBatchPush}
                  >
                    <Send size={14} />
                    推送活动
                  </button>
                  <button
                    className="text-xs text-gray-400 hover:text-gray-600 ml-1"
                    onClick={handleClearSelection}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>

            {/* 用户列表 */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users size={48} strokeWidth={1.2} className="mb-3" />
                  <p className="text-base font-medium mb-1">暂无用户</p>
                  <p className="text-sm">
                    {searchKeyword || activeFilterCount > 0
                      ? "没有匹配的用户，试试调整筛选条件"
                      : selectedActivityId
                        ? "该活动暂无报名用户"
                        : "暂无用户数据"}
                  </p>
                  {(searchKeyword || activeFilterCount > 0) && (
                    <button
                      className="mt-3 px-4 py-2 text-sm text-primary-400 hover:bg-primary-50 rounded-lg transition-colors"
                      onClick={handleClearFilters}
                    >
                      清除筛选条件
                    </button>
                  )}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    selected={selectedUserIds.has(user.id)}
                    onSelect={() => handleSelectUser(user.id)}
                    onClick={() => setDetailUser(user)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ============================================ */}
        {/* 「发现用户」视图 */}
        {/* ============================================ */}
        {activeTab === "discover" && (
          <>
            {/* 配额指示器 */}
            <QuotaIndicator quota={discoveryQuota} />

            {/* 筛选栏 */}
            <DiscoveryFilterBar
              criteria={discoveryFilter}
              options={discoveryFilterOptions}
              onChange={setDiscoveryFilter}
            />

            {/* 结果计数 */}
            <div className="text-sm text-gray-400">
              共发现 {filteredPlatformUsers.length} 位用户
            </div>

            {/* 平台用户卡片列表 */}
            <div className="space-y-3">
              {filteredPlatformUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users size={48} strokeWidth={1.2} className="mb-3" />
                  <p className="text-base font-medium mb-1">暂无匹配用户</p>
                  <p className="text-sm">试试调整筛选条件</p>
                  <button
                    className="mt-3 px-4 py-2 text-sm text-primary-400 hover:bg-primary-50 rounded-lg transition-colors"
                    onClick={() =>
                      setDiscoveryFilter({ ...DEFAULT_DISCOVERY_FILTER })
                    }
                  >
                    重置筛选
                  </button>
                </div>
              ) : (
                filteredPlatformUsers.map((user) => (
                  <DiscoveryUserCard
                    key={user.id}
                    user={user}
                    onViewDetail={() => setDiscoveryDetailUser(user)}
                    onUnlock={() => setUnlockTarget(user)}
                    onInvite={() => setInviteTarget(user)}
                    onToggleFavorite={() => handleToggleFavorite(user.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* 「我的用户」弹窗/抽屉 */}
      {/* ============================================ */}

      {/* 筛选面板 */}
      <UserPoolFilterDrawer
        visible={filterVisible}
        filterOptions={filterOptions}
        filterCriteria={filterCriteria}
        onChange={setFilterCriteria}
        onClose={() => setFilterVisible(false)}
      />

      {/* 用户详情抽屉 */}
      <UserDetailDrawer
        visible={detailUser !== null}
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onTagUser={(userId) => {
          setDetailUser(null);
          setSelectedUserIds(new Set([userId]));
          setTimeout(() => setBatchTagVisible(true), 300);
        }}
        onPushActivity={(userId) => {
          setDetailUser(null);
          setSelectedUserIds(new Set([userId]));
          setTimeout(() => setPushActivityVisible(true), 300);
        }}
      />

      {/* 批量打标签弹窗 */}
      <BatchTagModal
        visible={batchTagVisible}
        selectedCount={selectedUserIds.size}
        existingTags={customTags}
        onConfirm={handleBatchTagConfirm}
        onClose={() => setBatchTagVisible(false)}
      />

      {/* 推送活动弹窗 */}
      <PushActivityModal
        visible={pushActivityVisible}
        selectedCount={selectedUserIds.size}
        activities={pushActivityOptions}
        onConfirm={handlePushConfirm}
        onClose={() => setPushActivityVisible(false)}
      />

      {/* 标签管理 */}
      <CustomTagManager
        visible={tagManagerVisible}
        tags={customTags}
        onCreate={handleCreateTag}
        onDelete={handleDeleteTag}
        onClose={() => setTagManagerVisible(false)}
      />

      {/* ============================================ */}
      {/* 「发现用户」弹窗/抽屉 */}
      {/* ============================================ */}

      {/* 平台用户详情 */}
      <DiscoveryUserDetail
        visible={discoveryDetailUser !== null}
        user={discoveryDetailUser}
        onClose={() => setDiscoveryDetailUser(null)}
        onUnlock={handleDetailUnlock}
        onInvite={handleDetailInvite}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 解锁确认弹窗 */}
      <UnlockConfirmModal
        visible={unlockTarget !== null}
        user={unlockTarget}
        quota={discoveryQuota}
        onConfirm={handleUnlockConfirm}
        onClose={() => setUnlockTarget(null)}
      />

      {/* 邀请参加活动弹窗 */}
      <InviteActivityModal
        visible={inviteTarget !== null}
        user={inviteTarget}
        activities={inviteActivityOptions}
        onConfirm={handleInviteConfirm}
        onClose={() => setInviteTarget(null)}
      />
    </MerchantLayout>
  );
};

export default UserPoolPage;
