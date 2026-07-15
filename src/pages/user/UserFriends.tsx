/**
 * 用户端好友页面
 * 三个 Tab：好友（互关）/ 关注 / 粉丝
 */

import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessageCircle,
  Users,
  UserMinus,
  UserPlus2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Toast } from "@/components/ui/Toast";
import {
  useFriends,
  useFollowing,
  useFollowers,
  useToggleFollow,
  useSocialStats,
  type SocialUserBrief,
} from "@/features/social";
import { useAuthStore } from "@/features/auth/stores/authStore";

type Tab = "friends" | "following" | "followers";

const UserFriends: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const myId = user?.id;
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  const friendsQ = useFriends(myId);
  const followingQ = useFollowing(myId);
  const followersQ = useFollowers(myId);
  const { data: stats } = useSocialStats(myId);
  const toggleFollow = useToggleFollow();

  const list: SocialUserBrief[] = useMemo(() => {
    const raw =
      activeTab === "friends"
        ? friendsQ.data?.list
        : activeTab === "following"
          ? followingQ.data?.list
          : followersQ.data?.list;
    const arr = raw ?? [];
    if (!searchText) return arr;
    const t = searchText.toLowerCase();
    return arr.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(t) ||
        (u.account || "").toLowerCase().includes(t) ||
        (u.bio || "").toLowerCase().includes(t),
    );
  }, [activeTab, friendsQ.data, followingQ.data, followersQ.data, searchText]);

  const isLoading =
    (activeTab === "friends" && friendsQ.isLoading) ||
    (activeTab === "following" && followingQ.isLoading) ||
    (activeTab === "followers" && followersQ.isLoading);

  const friendsCount = stats?.friendsCount ?? friendsQ.data?.total ?? 0;
  const followingCount = stats?.followingCount ?? followingQ.data?.total ?? 0;
  const followersCount = stats?.followersCount ?? followersQ.data?.total ?? 0;

  const handleUnfollow = async (userId: string) => {
    try {
      await toggleFollow.mutateAsync({ userId, currentlyFollowing: true });
      Toast.show({ icon: "success", content: "已取消关注" });
    } catch (e) {
      Toast.show({
        icon: "fail",
        content: e instanceof Error ? e.message : "操作失败",
      });
    }
  };

  const handleFollowBack = async (userId: string) => {
    try {
      await toggleFollow.mutateAsync({ userId, currentlyFollowing: false });
      Toast.show({ icon: "success", content: "已关注" });
    } catch (e) {
      Toast.show({
        icon: "fail",
        content: e instanceof Error ? e.message : "操作失败",
      });
    }
  };

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[{ label: "首页", path: "/u/home" }, { label: "好友" }]}
    >
      <div className="md:py-6 lg:py-8">
        {/* 搜索框 + 发现新朋友入口 */}
        <div className="bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 space-y-2">
            <div className="h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center px-4 gap-2">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="搜索"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              onClick={() => navigate("/u/discover/people")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-800 text-left hover:shadow-sm transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                  <Sparkles size={14} className="text-primary-500" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    发现新朋友
                  </span>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                    按共同兴趣推荐，对方不会被通知
                  </span>
                </span>
              </span>
              <ArrowRight size={16} className="text-primary-500" />
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="flex gap-6">
              {[
                { key: "friends" as Tab, label: "好友", count: friendsCount },
                { key: "following" as Tab, label: "关注", count: followingCount },
                { key: "followers" as Tab, label: "粉丝", count: followersCount },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`pb-2 pt-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === t.key
                      ? "text-primary-500 border-primary-500"
                      : "text-slate-400 dark:text-gray-400 border-transparent"
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">加载中...</div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <Users
                size={40}
                className="text-slate-200 dark:text-gray-600 mx-auto mb-3"
              />
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                {searchText
                  ? "没有找到相关用户"
                  : activeTab === "friends"
                    ? "还没有互相关注的好友"
                    : activeTab === "following"
                      ? "还没有关注任何人"
                      : "还没有粉丝"}
              </p>
              {!searchText && activeTab === "friends" && (
                <p className="text-slate-300 dark:text-gray-600 text-xs mt-2">
                  在"关注"或"粉丝"中互相关注即可成为好友
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  tab={activeTab}
                  onClickRow={() => navigate(`/u/profile/${u.id}`)}
                  onMessage={(e) => {
                    e.stopPropagation();
                    navigate(`/u/messages/${u.id}`);
                  }}
                  onUnfollow={(e) => {
                    e.stopPropagation();
                    handleUnfollow(u.id);
                  }}
                  onFollowBack={(e) => {
                    e.stopPropagation();
                    handleFollowBack(u.id);
                  }}
                  busy={toggleFollow.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

interface UserRowProps {
  user: SocialUserBrief;
  tab: Tab;
  onClickRow: () => void;
  onMessage: (e: React.MouseEvent) => void;
  onUnfollow: (e: React.MouseEvent) => void;
  onFollowBack: (e: React.MouseEvent) => void;
  busy?: boolean;
}

const UserRow: FC<UserRowProps> = ({
  user,
  tab,
  onClickRow,
  onMessage,
  onUnfollow,
  onFollowBack,
  busy,
}) => {
  const initial = user.name?.charAt(0) || "?";
  return (
    <div
      onClick={onClickRow}
      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm transition-all cursor-pointer"
      role="button"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || ""}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-primary-600 font-semibold">{initial}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {user.name || "匿名用户"}
        </h3>
        {user.bio ? (
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">
            {user.bio}
          </p>
        ) : (
          user.account && (
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 truncate">
              @{user.account}
            </p>
          )
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onMessage}
          className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 flex items-center justify-center"
          title="私信"
          aria-label="私信"
        >
          <MessageCircle
            size={16}
            className="text-primary-500 dark:text-primary-400"
          />
        </button>
        {(tab === "following" || tab === "friends") && (
          <button
            onClick={onUnfollow}
            disabled={busy}
            className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-slate-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 [&>svg]:shrink-0"
            title="取消关注"
          >
            <UserMinus size={12} />
            已关注
          </button>
        )}
        {tab === "followers" && (
          <button
            onClick={onFollowBack}
            disabled={busy}
            className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50 [&>svg]:shrink-0"
            title="关注"
          >
            <UserPlus2 size={12} />
            关注
          </button>
        )}
      </div>
    </div>
  );
};

export default UserFriends;
