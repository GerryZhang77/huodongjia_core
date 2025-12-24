/**
 * 用户端好友页面
 * 展示用户的好友列表和好友管理
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  UserPlus,
  MessageCircle,
  Users,
  MoreHorizontal,
} from "lucide-react";

// Mock 好友数据
const mockFriends = [
  {
    id: "f1",
    name: "小红",
    avatar: "https://i.pravatar.cc/100?img=5",
    occupation: "产品经理",
    company: "阿里巴巴",
    commonActivities: 3,
    isOnline: true,
  },
  {
    id: "f2",
    name: "大伟",
    avatar: "https://i.pravatar.cc/100?img=11",
    occupation: "前端工程师",
    company: "字节跳动",
    commonActivities: 2,
    isOnline: true,
  },
  {
    id: "f3",
    name: "婷婷",
    avatar: "https://i.pravatar.cc/100?img=9",
    occupation: "UI设计师",
    company: "美团",
    commonActivities: 5,
    isOnline: false,
  },
  {
    id: "f4",
    name: "阿杰",
    avatar: "https://i.pravatar.cc/100?img=12",
    occupation: "后端工程师",
    company: "腾讯",
    commonActivities: 1,
    isOnline: false,
  },
  {
    id: "f5",
    name: "小丽",
    avatar: "https://i.pravatar.cc/100?img=20",
    occupation: "运营经理",
    company: "拼多多",
    commonActivities: 4,
    isOnline: true,
  },
];

// 好友请求数据
const mockRequests = [
  {
    id: "r1",
    name: "张三",
    avatar: "https://i.pravatar.cc/100?img=15",
    occupation: "数据分析师",
    message: "我们在读书会认识的",
  },
];

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
    <div className="min-h-screen bg-slate-50">
      {/* 响应式容器 */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white min-h-screen shadow-sm md:shadow-lg">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 md:px-6 pt-12 md:pt-6 pb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mr-3"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">我的好友</h1>
            </div>
            <button className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
              <UserPlus size={18} className="text-primary-500" />
            </button>
          </div>
        </header>

        {/* 搜索框 */}
        <div className="px-4 md:px-6 py-3 bg-white">
          <div className="h-10 rounded-full bg-slate-100 flex items-center px-4 gap-2">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索好友..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="px-4 md:px-6 py-2 bg-white border-b border-slate-100">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("friends")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "friends"
                  ? "text-primary-500 border-primary-500"
                  : "text-slate-400 border-transparent"
              }`}
            >
              好友 ({mockFriends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors relative ${
                activeTab === "requests"
                  ? "text-primary-500 border-primary-500"
                  : "text-slate-400 border-transparent"
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
                <Users size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
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
          ) : (
            /* 好友申请 */
            mockRequests.length === 0 ? (
              <div className="py-16 text-center">
                <UserPlus size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">暂无好友申请</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
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
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
      {/* 头像 */}
      <div className="relative">
        <img
          src={friend.avatar}
          alt={friend.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {friend.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success-500 border-2 border-white" />
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{friend.name}</h3>
          {friend.commonActivities > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-primary-50 text-[10px] text-primary-500">
              {friend.commonActivities}次同活动
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {friend.occupation} · {friend.company}
        </p>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
          <MessageCircle size={16} className="text-primary-500" />
        </button>
        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <MoreHorizontal size={16} className="text-slate-400" />
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
    <div className="p-4 rounded-2xl bg-white border border-slate-100">
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <img
          src={request.avatar}
          alt={request.name}
          className="w-12 h-12 rounded-full object-cover"
        />

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{request.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{request.occupation}</p>
          <p className="text-xs text-slate-400 mt-1 italic">
            &quot;{request.message}&quot;
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setHandled(true)}
          className="flex-1 h-9 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
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
