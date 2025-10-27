import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  NavBar,
  Button,
  Card,
  Tag,
  Toast,
  ActionSheet,
  Dialog,
  Tabs,
  List,
  Avatar,
  Badge,
} from "antd-mobile";
import {
  MoreOutline,
  EditSOutline,
  UserOutline,
  CalendarOutline,
  LocationOutline,
  TeamOutline,
  MessageOutline,
} from "antd-mobile-icons";
import { useStore } from "../store";

interface Activity {
  activity_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: string;
  cover_image?: string;
  category: string;
  tags: string[];
  requirements?: string;
  contact_info?: string;
  created_at: string;
}

interface Participant {
  user_id: string;
  name: string;
  avatar?: string;
  registration_time: string;
  status: "confirmed" | "waitlist" | "cancelled";
}

const ActivityDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detail");

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      const response = await fetch(`/api/event-detail/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setActivity(data.event);
      } else {
        Toast.show(data.message || "获取活动详情失败");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Fetch activity detail error:", error);
      Toast.show("网络错误，请重试");
      navigate("/dashboard");
    }
  };

  // 获取参与者列表
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/event-participants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Fetch participants error:", error);
    }
  };

  useEffect(() => {
    if (id) {
      Promise.all([fetchActivityDetail(), fetchParticipants()]).finally(() =>
        setLoading(false)
      );
    }
  }, [id]);

  // 更多操作
  const handleMoreActions = () => {
    ActionSheet.show({
      actions: [
        {
          text: "编辑活动",
          key: "edit",
          onClick: () => navigate(`/activity/${id}/edit`),
        },
        {
          text: "报名管理",
          key: "enrollment",
          onClick: () => navigate(`/activity/${id}/enrollment`),
        },
        {
          text: "匹配配置",
          key: "matching",
          onClick: () => navigate(`/activity/${id}/matching`),
        },
        {
          text: "取消活动",
          key: "cancel",
          danger: true,
          onClick: () => handleCancelActivity(),
        },
      ],
      cancelText: "取消",
    });
  };

  // 取消活动
  const handleCancelActivity = () => {
    Dialog.confirm({
      content: "确定要取消这个活动吗？取消后无法恢复。",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/delete-event/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (data.success) {
            Toast.show("活动已取消");
            navigate("/dashboard");
          } else {
            Toast.show(data.message || "取消失败");
          }
        } catch (error) {
          console.error("Cancel activity error:", error);
          Toast.show("网络错误，请重试");
        }
      },
    });
  };

  // 状态标签配置
  const getStatusTag = (status: string) => {
    const statusConfig = {
      draft: { text: "草稿", color: "default" },
      published: { text: "已发布", color: "primary" },
      ongoing: { text: "进行中", color: "success" },
      completed: { text: "已结束", color: "default" },
      cancelled: { text: "已取消", color: "danger" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Tag color={config.color} fill="outline">
        {config.text}
      </Tag>
    );
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 计算参与率
  const getParticipationRate = () => {
    if (!activity || activity.max_participants === 0) return 0;
    return Math.round(
      (activity.current_participants / activity.max_participants) * 100
    );
  };

  if (loading || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate("/dashboard")}
        right={
          <Button fill="none" onClick={handleMoreActions}>
            <MoreOutline />
          </Button>
        }
        style={{
          "--height": "48px",
          "--border-bottom": "1px solid var(--adm-border-color)",
        }}
      >
        活动详情
      </NavBar>

      {/* 封面图片 */}
      {activity.cover_image && (
        <div className="relative">
          <img
            src={activity.cover_image}
            alt={activity.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            {getStatusTag(activity.status)}
          </div>
        </div>
      )}

      {/* 基本信息 */}
      <div className="p-4">
        <Card style={{ "--border-radius": "12px" }}>
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {activity.title}
              </h1>
              {!activity.cover_image && (
                <div className="mb-2">{getStatusTag(activity.status)}</div>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                {activity.description}
              </p>
            </div>

            {/* 标签 */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    color="primary"
                    fill="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}

            {/* 时间地点信息 */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarOutline className="mr-3 text-blue-500" />
                <div>
                  <div>开始：{formatDateTime(activity.start_time)}</div>
                  <div>结束：{formatDateTime(activity.end_time)}</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <LocationOutline className="mr-3 text-blue-500" />
                <span>{activity.location}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <UserOutline className="mr-3 text-blue-500" />
                  <span>
                    {activity.current_participants}/{activity.max_participants}{" "}
                    人
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${getParticipationRate()}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {getParticipationRate()}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 标签页 */}
      <div className="bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            "--content-padding": "16px",
            "--title-font-size": "14px",
          }}
        >
          <Tabs.Tab title="详细信息" key="detail">
            <div className="space-y-4">
              {activity.requirements && (
                <Card title="参与要求" style={{ "--border-radius": "12px" }}>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {activity.requirements}
                  </p>
                </Card>
              )}

              {activity.contact_info && (
                <Card title="联系方式" style={{ "--border-radius": "12px" }}>
                  <div className="flex items-center">
                    <MessageOutline className="mr-2 text-blue-500" />
                    <span className="text-gray-600 text-sm">
                      {activity.contact_info}
                    </span>
                  </div>
                </Card>
              )}

              <Card title="活动信息" style={{ "--border-radius": "12px" }}>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>活动分类：</span>
                    <span>{activity.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>创建时间：</span>
                    <span>{formatDateTime(activity.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>活动ID：</span>
                    <span className="font-mono text-xs">
                      {activity.activity_id}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </Tabs.Tab>

          <Tabs.Tab
            title={`参与者 (${participants.length})`}
            key="participants"
          >
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无参与者</div>
            ) : (
              <List>
                {participants.map((participant) => (
                  <List.Item
                    key={participant.user_id}
                    prefix={
                      <Avatar
                        src={participant.avatar}
                        style={{ "--size": "40px" }}
                      >
                        {participant.name.charAt(0)}
                      </Avatar>
                    }
                    extra={
                      <Badge
                        content={
                          participant.status === "confirmed"
                            ? "已确认"
                            : participant.status === "waitlist"
                            ? "候补"
                            : "已取消"
                        }
                        color={
                          participant.status === "confirmed"
                            ? "success"
                            : participant.status === "waitlist"
                            ? "warning"
                            : "danger"
                        }
                      />
                    }
                  >
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-xs text-gray-500">
                        报名时间：
                        {formatDateTime(participant.registration_time)}
                      </div>
                    </div>
                  </List.Item>
                ))}
              </List>
            )}
          </Tabs.Tab>
        </Tabs>
      </div>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex space-x-3">
          <Button
            color="primary"
            fill="outline"
            size="large"
            onClick={() => navigate(`/activity/${id}/edit`)}
            style={{
              "--border-radius": "12px",
              flex: 1,
            }}
          >
            <EditSOutline className="mr-1" />
            编辑
          </Button>

          <Button
            color="primary"
            size="large"
            onClick={() => navigate(`/activity/${id}/enrollment`)}
            style={{
              "--border-radius": "12px",
              flex: 1,
            }}
          >
            <TeamOutline className="mr-1" />
            报名管理
          </Button>

          <Button
            color="primary"
            size="large"
            onClick={() => navigate(`/activity/${id}/matching`)}
            style={{
              "--border-radius": "12px",
              flex: 1,
            }}
          >
            匹配配置
          </Button>
        </div>
      </div>

      {/* 底部安全区域 */}
      <div className="h-20"></div>
    </div>
  );
};

export default ActivityDetail;
