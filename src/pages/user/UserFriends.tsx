/**
 * 用户端好友页面
 * 展示用户的好友列表和好友管理
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  MessageCircle,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";

const mockFriends: never[] = [];
const mockRequests: never[] = [];

const UserFriends: FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  const filteredFriends = mockFriends.filter(
    (friend) =>
      friend.name.includes(searchText) ||
      friend.occupation.includes(searchText) ||
      friend.company.includes(searchText)
  );

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[{ label: "首页", path: "/u/home" }, { label: "好友" }]}
      topBarRightContent={
        <button className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center hover:bg-primary-100 transition-colors">
          <UserPlus size={18} className="text-primary-400" />
        </button>
      }
    >
      <div className="md:py-6 lg:py-8">
        {/* 搜索框 */}
        <div className="px-4 md:px-6 py-3 bg-white dark:bg-gray-800">
          <div className="h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center px-4 gap-2">
            <Search
              size={16}
              className="text-slate-400 dark:text-gray-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="搜索好友..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="px-4 md:px-6 py-2 bg-white dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("friends")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "friends"
                  ? "text-primary-500 border-primary-500"
                  : "text-slate-400 dark:text-gray-400 border-transparent"
              }`}
            >
              好友 ({mockFriends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors relative ${
                activeTab === "requests"
                  ? "text-primary-500 border-primary-500"
                  : "text-slate-400 dark:text-gray-400 border-transparent"
              }`}
            >
              申请 ({mockRequests.length})
              {mockRequests.length > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {mockRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="px-4 md:px-6 py-4">
          {activeTab === "friends" ? (
            /* 好友列表 */
            filteredFriends.length === 0 ? (
              <div className="py-16 text-center">
                <Users
                  size={40}
                  className="text-slate-200 dark:text-gray-600 mx-auto mb-3"
                />
                <p className="text-slate-400 dark:text-gray-500 text-sm">
                  {searchText ? "没有找到相关好友" : "还没有好友"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            )
          ) : /* 好友申请 */
          mockRequests.length === 0 ? (
            <div className="py-16 text-center">
              <UserPlus
                size={40}
                className="text-slate-200 dark:text-gray-600 mx-auto mb-3"
              />
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                暂无好友申请
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

// 好友卡片组件
interface FriendCardProps {
  friend: {
    id: string;
    name: string;
    avatar: string;
    occupation: string;
    company: string;
    commonActivities: number;
    isOnline: boolean;
  };
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      {/* 头像 */}
      <div className="relative">
        <img
          src={friend.avatar}
          alt={friend.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {friend.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success-500 border-2 border-white dark:border-gray-800" />
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {friend.name}
          </h3>
          {friend.commonActivities > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-900/30 text-[10px] text-primary-500 dark:text-primary-400">
              {friend.commonActivities}次同活动
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          {friend.occupation} · {friend.company}
        </p>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <MessageCircle
            size={16}
            className="text-primary-500 dark:text-primary-400"
          />
        </button>
        <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
          <MoreHorizontal
            size={16}
            className="text-slate-400 dark:text-gray-400"
          />
        </button>
      </div>
    </div>
  );
};

// 申请卡片组件
interface RequestCardProps {
  request: {
    id: string;
    name: string;
    avatar: string;
    occupation: string;
    message: string;
  };
}

const RequestCard: FC<RequestCardProps> = ({ request }) => {
  const [handled, setHandled] = useState(false);

  if (handled) return null;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <img
          src={request.avatar}
          alt={request.name}
          className="w-12 h-12 rounded-full object-cover"
        />

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {request.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            {request.occupation}
          </p>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 italic">
            &quot;{request.message}&quot;
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setHandled(true)}
          className="flex-1 h-9 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
        >
          忽略
        </button>
        <button
          onClick={() => setHandled(true)}
          className="flex-1 h-9 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          同意
        </button>
      </div>
    </div>
  );
};

export default UserFriends;
