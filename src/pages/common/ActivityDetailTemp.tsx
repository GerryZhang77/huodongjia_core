/**
 * ActivityDetailTemp - 临时活动详情页面
 * 用于演示模式，展示骨干大团建活动详情
 * 商家视角，无报名按钮
 */

import { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavBar, Tag } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { demoActivity, isDemoActivity } from "@/mocks/demo-activity";

/**
 * ActivityDetailTemp 组件
 */
export const ActivityDetailTemp: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 判断是否为演示活动
  const isDemo = id ? isDemoActivity(id) : false;
  const activity = isDemo ? demoActivity : null;

  // 如果不是演示活动，跳转回 Dashboard
  if (!activity) {
    navigate("/dashboard");
    return null;
  }

  // 格式化日期范围
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateStr = startDate.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeStr = `${startDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}-${endDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 - 优化设计 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
        <NavBar
          back={null}
          onBack={() => navigate("/dashboard")}
          backIcon={<LeftOutline />}
          className="border-b border-gray-100/50"
          left={
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LeftOutline className="text-xl" />
              <span className="text-sm font-medium">返回</span>
            </button>
          }
        >
          <span className="text-lg font-bold text-gray-900 tracking-wide">
            活动详情
          </span>
        </NavBar>
      </div>

      {/* 封面图片 - 优化比例 */}
      <div className="relative">
        <div
          className="relative w-full"
          style={{
            paddingTop: "clamp(200px, 40vw, 400px)",
            maxHeight: "400px",
          }}
        >
          {/* 响应式高度: 移动端约200-250px，桌面端约300-400px */}
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        {/* 状态标签 - 优化样式 */}
        <div className="absolute top-4 right-4">
          <div className="bg-success-500 text-white px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="text-sm font-semibold">🎉 招募中</span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        {/* 标题与标签 */}
        <div className="bg-white rounded-xl p-6 -mt-6 relative shadow-md mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {activity.title}
          </h1>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "#骨干迎新",
              "#创新创业",
              "#互动匹配",
              "#NFC联动",
              "#创意交流",
              "#资源对接",
            ].map((tag) => (
              <Tag key={tag} color="primary" fill="outline" className="text-xs">
                {tag}
              </Tag>
            ))}
          </div>

          {/* 简介 */}
          <p className="text-gray-600 leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* 核心信息卡片 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-1 h-5 bg-primary-500 rounded mr-2"></span>
            活动信息
          </h2>

          <div className="space-y-4">
            {/* 时间 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                📅 时间
              </div>
              <div className="flex-1 text-gray-900">
                {formatDateRange(activity.activityStart, activity.activityEnd)}
              </div>
            </div>

            {/* 地点 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                📍 地点
              </div>
              <div className="flex-1 text-gray-900">{activity.location}</div>
            </div>

            {/* 主办方 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                🏫 主办
              </div>
              <div className="flex-1 text-gray-900">
                {activity.organizerName}
              </div>
            </div>

            {/* 费用 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                💰 费用
              </div>
              <div className="flex-1">
                <span className="text-success-500 font-semibold">
                  {activity.fee}
                </span>
              </div>
            </div>

            {/* 人数 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                👥 人数
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900">
                    {activity.enrolledCount}/{activity.capacity} 人
                  </span>
                  <div className="flex-1 max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{
                        width: `${
                          (activity.enrolledCount / activity.capacity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 时长 */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 text-gray-500 text-sm">
                ⏱️ 时长
              </div>
              <div className="flex-1 text-gray-900">{activity.duration}</div>
            </div>
          </div>
        </div>

        {/* 活动流程 */}
        {activity.schedule && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-5 bg-primary-500 rounded mr-2"></span>
              活动流程
            </h2>

            <div className="space-y-4">
              {activity.schedule.map((item, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 w-28 text-primary-600 font-medium text-sm">
                    {item.time}
                  </div>
                  <div className="flex-1 border-l-2 border-gray-200 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 活动亮点 */}
        {activity.highlights && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-5 bg-primary-500 rounded mr-2"></span>
              活动亮点
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activity.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">
                      {highlight.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {highlight.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 活动公告 - 优化设计 */}
        {activity.announcement && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl">📌</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {activity.announcement.title}
              </h2>
            </div>

            <div className="space-y-3 pl-1">
              {activity.announcement.content.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="flex-1 text-sm text-gray-700 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部安全区域 */}
      <div className="h-8"></div>
    </div>
  );
};

export default ActivityDetailTemp;
