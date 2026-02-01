/**
 * 报名管理页面 (新版)
 * 使用 MerchantLayout 布局
 */

import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Upload,
  Download,
  Filter,
  Send,
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  Loader2,
  Check,
} from "lucide-react";
import { Toast } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";
import {
  ImportEnrollmentModal,
  SendNotificationModal,
  ExportEnrollmentModal,
} from "@/components/enrollment";
import { useStore } from "@/store";
import type { Enrollment, FilterCriteria } from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA, STATUS_LABELS } from "@/types/enrollment";
import {
  calculateFilterOptions,
  applyFilters,
  getActiveFilterCount,
} from "@/utils/enrollmentFilters";
import { isDemoActivity } from "@/mocks/demo-activity";

/**
 * 状态标签颜色映射
 */
const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-yellow-600",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

/**
 * 报名卡片组件
 */
interface EnrollmentCardProps {
  enrollment: Enrollment;
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  selected,
  onSelect,
  onApprove,
  onReject,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        selected ? "border-primary-400 bg-primary-50/30" : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 选择框 */}
        <button
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            selected
              ? "bg-primary-400 border-primary-400"
              : "border-gray-300 hover:border-primary-400"
          }`}
          onClick={onSelect}
        >
          {selected && <Check size={12} className="text-white" />}
        </button>

        {/* 头像 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 font-medium text-sm">
            {enrollment.name.slice(0, 1)}
          </span>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{enrollment.name}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${statusColors[enrollment.status] || "bg-gray-100 text-gray-500"}`}
            >
              {STATUS_LABELS[enrollment.status] || enrollment.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 space-x-3">
            {enrollment.gender && <span>{enrollment.gender}</span>}
            {enrollment.age && <span>{enrollment.age}岁</span>}
            {enrollment.industry && <span>{enrollment.industry}</span>}
          </div>
          {enrollment.tags && enrollment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {enrollment.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {enrollment.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{enrollment.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="relative flex-shrink-0">
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[100px] z-20">
                {enrollment.status === "pending" && (
                  <>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                      onClick={() => {
                        onApprove();
                        setShowMenu(false);
                      }}
                    >
                      <CheckCircle size={14} />
                      通过
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => {
                        onReject();
                        setShowMenu(false);
                      }}
                    >
                      <XCircle size={14} />
                      拒绝
                    </button>
                  </>
                )}
                <button
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMenu(false)}
                >
                  查看详情
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * EnrollmentManagement 页面组件
 */
const EnrollmentManagementNew: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useStore();

  // 报名数据
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterCriteria, _setFilterCriteria] = useState<FilterCriteria>(
    DEFAULT_FILTER_CRITERIA,
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal 状态
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // 计算筛选选项 (预留给高级筛选功能)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _filterOptions = useMemo(() => {
    return calculateFilterOptions(enrollments);
  }, [enrollments]);

  // 应用筛选
  const filteredEnrollments = useMemo(() => {
    let filtered = applyFilters(enrollments, filterCriteria);

    // 按 Tab 过滤状态
    if (activeTab !== "all") {
      filtered = filtered.filter((e) => e.status === activeTab);
    }

    // 搜索关键词
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(keyword) ||
          e.tags?.some((t) => t.toLowerCase().includes(keyword)),
      );
    }

    return filtered;
  }, [enrollments, filterCriteria, activeTab, searchKeyword]);

  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filterCriteria);
  }, [filterCriteria]);

  // 获取报名列表
  const fetchEnrollments = async () => {
    try {
      const requestId = isDemoActivity(id)
        ? "00000000-0000-0000-0000-000000000000"
        : id;

      const response = await fetch(`/api/events/${requestId}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (isDemoActivity(id) && response.status === 404) {
          setEnrollments([]);
          return;
        }
        throw new Error("请求失败");
      }

      const data = await response.json();
      console.log("[EnrollmentManagement] API 返回数据:", data);
      setEnrollments(data.data || []);
    } catch (error) {
      console.error("获取报名列表失败:", error);
      Toast.show({ content: "获取报名列表失败" });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  React.useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 选择操作
  const toggleSelect = (enrollmentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId],
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredEnrollments.map((e) => e.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // 审核操作
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApprove = async (enrollmentId: string) => {
    Toast.show({ content: "审核通过" });
    // TODO: 调用 API 传入 enrollmentId
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReject = async (enrollmentId: string) => {
    Toast.show({ content: "已拒绝" });
    // TODO: 调用 API 传入 enrollmentId
  };

  // 批量操作
  const handleBatchApprove = async () => {
    Toast.show({ content: `已通过 ${selectedIds.length} 人` });
    clearSelection();
  };

  const handleBatchReject = async () => {
    Toast.show({ content: `已拒绝 ${selectedIds.length} 人` });
    clearSelection();
  };

  // 导入导出
  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleImportSuccess = (count: number) => {
    // 导入成功后刷新数据
    fetchEnrollments();
    Toast.show({ content: `成功导入 ${count} 条数据` });
  };

  const handleSendNotification = () => {
    console.log(
      "[EnrollmentManagement] 打开通知弹窗, enrollments:",
      enrollments?.length,
      enrollments,
    );
    setShowNotifyModal(true);
  };

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: enrollments.length,
      pending: enrollments.filter((e) => e.status === "pending").length,
      approved: enrollments.filter((e) => e.status === "approved").length,
      rejected: enrollments.filter((e) => e.status === "rejected").length,
    };
  }, [enrollments]);

  return (
    <MerchantLayout
      title="报名管理"
      showBack
      onBack={() => navigate("/dashboard")}
    >
      <div className="space-y-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">全部</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">待审核</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">已通过</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-500">{stats.rejected}</p>
            <p className="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="搜索姓名、标签..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* 筛选按钮 */}
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <Filter size={14} />
              筛选
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-primary-400 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* 导入导出 */}
          <div className="flex items-center gap-2">
            <button
              className="h-8 px-3 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100 flex items-center gap-1"
              onClick={handleImport}
            >
              <Upload size={14} />
              导入
            </button>
            <button
              className="h-8 px-3 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
              onClick={handleExport}
            >
              <Download size={14} />
              导出
            </button>
            <button
              className="h-8 px-3 rounded-lg bg-accent-50 text-accent-600 text-sm font-medium hover:bg-accent-100 flex items-center gap-1"
              onClick={handleSendNotification}
            >
              <Send size={14} />
              发送通知
            </button>
          </div>
        </div>

        {/* Tab 筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: `全部 (${stats.total})` },
            { key: "pending", label: `待审核 (${stats.pending})` },
            { key: "approved", label: `已通过 (${stats.approved})` },
            { key: "rejected", label: `已拒绝 (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-primary-400 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 批量操作栏 */}
        {selectedIds.length > 0 && (
          <div className="bg-primary-50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-600">
                已选择 {selectedIds.length} 人
              </span>
              <button
                className="text-sm text-primary-500 hover:underline"
                onClick={selectAll}
              >
                全选
              </button>
              <button
                className="text-sm text-gray-500 hover:underline"
                onClick={clearSelection}
              >
                取消
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className="h-8 px-3 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                onClick={handleBatchApprove}
              >
                批量通过
              </button>
              <button
                className="h-8 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                onClick={handleBatchReject}
              >
                批量拒绝
              </button>
            </div>
          </div>
        )}

        {/* 报名列表 */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              <p className="text-gray-500 mt-4">正在加载报名列表...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无报名数据</p>
              <button
                className="mt-4 px-4 py-2 bg-primary-400 text-white rounded-full text-sm font-medium hover:bg-primary-500 transition-colors"
                onClick={handleImport}
              >
                导入报名
              </button>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                selected={selectedIds.includes(enrollment.id)}
                onSelect={() => toggleSelect(enrollment.id)}
                onApprove={() => handleApprove(enrollment.id)}
                onReject={() => handleReject(enrollment.id)}
              />
            ))
          )}
        </div>

        {/* 导入报名弹窗 */}
        <ImportEnrollmentModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
          activityId={id || ""}
          onSuccess={handleImportSuccess}
        />

        {/* 发送通知弹窗 */}
        <SendNotificationModal
          visible={showNotifyModal}
          onClose={() => setShowNotifyModal(false)}
          activityId={id || ""}
          enrollments={enrollments}
          selectedIds={selectedIds}
          onSuccess={(count) => {
            console.log(
              `[EnrollmentManagement] 通知发送成功，发送数量: ${count}`,
            );
            // 发送成功后清空选中
            setSelectedIds([]);
          }}
        />

        {/* 导出报名弹窗 */}
        <ExportEnrollmentModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          activityId={id || ""}
          activityTitle="活动"
          enrollments={filteredEnrollments}
        />
      </div>
    </MerchantLayout>
  );
};

export default EnrollmentManagementNew;
