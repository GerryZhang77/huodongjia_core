import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { Toast, Dialog, Switch } from "antd-mobile";
import { UserLayout } from "@/components/layout/UserLayout";
import { useDiscoverUsers } from "@/features/social/user-discover";
import { useUserProfile } from "@/features/user";
import { useUpdateProfile } from "@/features/user/profile/hooks/useUpdateProfile";

const PRIVACY_HINT_KEY = "userDiscoverPeople.privacyHintDismissed";

const UserDiscoverPeople: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // 关键字防抖
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => window.clearTimeout(t);
  }, [keyword]);

  const { data: profileData } = useUserProfile();
  const myProfile = profileData?.profile;
  const updateProfile = useUpdateProfile();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverUsers(debouncedKeyword);

  const users = useMemo(
    () => data?.pages.flatMap((p) => p.users) ?? [],
    [data],
  );

  // 首次进入页面：若用户从未看过隐私引导且当前未启用 discoverable，弹一次说明
  useEffect(() => {
    if (!myProfile) return;
    const dismissed = localStorage.getItem(PRIVACY_HINT_KEY) === "1";
    if (!dismissed && !myProfile.discoverable) {
      setShowPrivacyModal(true);
    }
  }, [myProfile]);

  const handleEnableDiscoverable = async (enable: boolean) => {
    try {
      await updateProfile.mutateAsync({ discoverable: enable });
      Toast.show({
        icon: "success",
        content: enable ? "已加入发现列表" : "已退出发现列表",
      });
    } catch (err: any) {
      Toast.show({
        icon: "fail",
        content: err?.message || "操作失败",
      });
    }
  };

  const dismissPrivacyHint = () => {
    localStorage.setItem(PRIVACY_HINT_KEY, "1");
    setShowPrivacyModal(false);
  };

  return (
    <UserLayout
      showTabBar
      showTopBar
      showBreadcrumb
      breadcrumbItems={[{ label: "首页", path: "/u/home" }, { label: "发现用户" }]}
    >
      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* 顶部：搜索 + 自身可被发现状态 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="按昵称 / 行业 / 简介搜索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {keyword && (
              <button onClick={() => setKeyword("")}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* 自身可被发现 toggle */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-2 min-w-0">
              <ShieldCheck
                size={16}
                className={`mt-0.5 flex-shrink-0 ${
                  myProfile?.discoverable
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  允许他人发现我
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  开启后你会出现在他人的"发现用户"列表，
                  仅展示头像 / 名字 / 城市 / 兴趣 / 简介，不会暴露联系方式。
                </p>
              </div>
            </div>
            <Switch
              checked={!!myProfile?.discoverable}
              onChange={(v) => handleEnableDiscoverable(v)}
              loading={updateProfile.isPending}
              style={
                {
                  "--checked-color": "var(--primary-500, #6366f1)",
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        {/* 列表 */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">加载中...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users
              size={36}
              className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-sm">
              {debouncedKeyword
                ? `没有匹配「${debouncedKeyword}」的用户`
                : "暂无可发现的用户"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => navigate(`/u/profile/${u.id}`)}
                className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm hover:border-gray-200 transition-all flex items-start gap-3"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-semibold">
                      {u.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {u.name}
                    </span>
                    {!!u.sharedTagCount && u.sharedTagCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                        <Sparkles size={10} />
                        {u.sharedTagCount} 个共同兴趣
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {u.occupation && <span>{u.occupation}</span>}
                    {u.industry && <span>· {u.industry}</span>}
                    {u.city && <span>· {u.city}</span>}
                    {u.age != null && <span>· {u.age}岁</span>}
                  </div>
                  {u.bio && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {u.bio}
                    </p>
                  )}
                  {u.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {u.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[10px] rounded text-gray-500 bg-gray-50 border border-gray-100"
                        >
                          {t}
                        </span>
                      ))}
                      {u.tags.length > 4 && (
                        <span className="text-[10px] text-gray-400">
                          +{u.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 mt-1 flex-shrink-0"
                />
              </button>
            ))}

            {/* 加载更多 */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-sm text-primary-500 hover:text-primary-600 disabled:opacity-50"
              >
                {isFetchingNextPage ? "加载中..." : "加载更多"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 隐私引导 Modal（首次进入） */}
      {showPrivacyModal && (
        <Dialog
          visible
          title="关于你的隐私"
          content={
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>"发现用户"默认 <strong>不展示</strong>你。</p>
              <p>
                开启
                <span className="text-primary-500 mx-0.5">"允许他人发现我"</span>
                后，他人能看到你的：
              </p>
              <ul className="list-disc list-inside pl-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <li>头像 / 昵称 / 城市 / 行业 / 简介 / 兴趣标签</li>
                <li>不会展示联系方式（手机 / 邮箱 / 微信）</li>
                <li>对方查看你时不会通知你（匿名浏览）</li>
              </ul>
              <p className="text-xs text-gray-400 mt-1">
                你可以随时关闭此开关，立即从他人列表中消失。
              </p>
            </div>
          }
          actions={[
            [
              {
                key: "later",
                text: "稍后再说",
                onClick: dismissPrivacyHint,
              },
              {
                key: "enable",
                text: "立即开启",
                bold: true,
                onClick: async () => {
                  await handleEnableDiscoverable(true);
                  dismissPrivacyHint();
                },
              },
            ],
          ]}
        />
      )}
    </UserLayout>
  );
};

export default UserDiscoverPeople;
