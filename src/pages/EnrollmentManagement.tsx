import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  NavBar,
  Button,
  Card,
  List,
  Avatar,
  Badge,
  Toast,
  ActionSheet,
  Dialog,
  SearchBar,
  Tabs,
  Selector,
  TextArea,
  Modal,
  Tag,
  Empty,
} from "antd-mobile";
import {
  UploadOutline,
  DownlandOutline,
  FilterOutline,
  MessageOutline,
  UserOutline,
  CheckCircleOutline,
  CloseCircleOutline,
} from "antd-mobile-icons";
import { useStore } from "../store";

interface Participant {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  registration_time: string;
  status: "confirmed" | "waitlist" | "cancelled";
  additional_info?: any;
}

interface FilterOptions {
  status: string[];
  registrationDate: string;
  searchText: string;
}

const EnrollmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    registrationDate: "",
    searchText: "",
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
        setFilteredParticipants(data.participants || []);
      } else {
        Toast.show(data.message || "获取参与者列表失败");
      }
    } catch (error) {
      console.error("Fetch participants error:", error);
      Toast.show("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchParticipants();
    }
  }, [id]);

  // 筛选参与者
  useEffect(() => {
    let filtered = participants;

    // 按状态筛选
    if (activeTab !== "all") {
      filtered = filtered.filter((p) => p.status === activeTab);
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.phone?.includes(searchText)
      );
    }

    setFilteredParticipants(filtered);
  }, [participants, activeTab, searchText]);

  // Excel导入
  const handleExcelImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      Toast.show("请选择Excel文件");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("activity_id", id!);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/import-participants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        Toast.show(`成功导入 ${data.imported_count} 位参与者`);
        fetchParticipants();
      } else {
        Toast.show(data.message || "导入失败");
      }
    } catch (error) {
      console.error("Import error:", error);
      Toast.show("导入失败，请重试");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 导出Excel
  const handleExcelExport = async () => {
    try {
      const response = await fetch(`/api/export-participants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participants_${id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        Toast.show("导出成功");
      } else {
        Toast.show("导出失败");
      }
    } catch (error) {
      console.error("Export error:", error);
      Toast.show("导出失败，请重试");
    }
  };

  // 发送通知
  const handleSendNotification = async () => {
    if (!notificationContent.trim()) {
      Toast.show("请输入通知内容");
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_id: id,
          participant_ids:
            selectedParticipants.length > 0 ? selectedParticipants : undefined,
          message: notificationContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show("通知发送成功");
        setShowNotificationModal(false);
        setNotificationContent("");
        setSelectedParticipants([]);
      } else {
        Toast.show(data.message || "发送失败");
      }
    } catch (error) {
      console.error("Send notification error:", error);
      Toast.show("发送失败，请重试");
    }
  };

  // 更新参与者状态
  const updateParticipantStatus = async (
    userId: string,
    status: "confirmed" | "waitlist" | "cancelled"
  ) => {
    try {
      const response = await fetch("/api/update-participant-status", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_id: id,
          user_id: userId,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show("状态更新成功");
        fetchParticipants();
      } else {
        Toast.show(data.message || "更新失败");
      }
    } catch (error) {
      console.error("Update status error:", error);
      Toast.show("更新失败，请重试");
    }
  };

  // 参与者操作
  const handleParticipantAction = (participant: Participant) => {
    ActionSheet.show({
      actions: [
        {
          text: "确认参与",
          key: "confirm",
          onClick: () =>
            updateParticipantStatus(participant.user_id, "confirmed"),
        },
        {
          text: "加入候补",
          key: "waitlist",
          onClick: () =>
            updateParticipantStatus(participant.user_id, "waitlist"),
        },
        {
          text: "取消报名",
          key: "cancel",
          danger: true,
          onClick: () =>
            updateParticipantStatus(participant.user_id, "cancelled"),
        },
      ],
      cancelText: "取消",
    });
  };

  // 状态标签配置
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { text: "已确认", color: "success" },
      waitlist: { text: "候补", color: "warning" },
      cancelled: { text: "已取消", color: "danger" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.confirmed;
    return <Badge content={config.text} color={config.color} />;
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabItems = [
    { key: "all", title: `全部 (${participants.length})` },
    {
      key: "confirmed",
      title: `已确认 (${
        participants.filter((p) => p.status === "confirmed").length
      })`,
    },
    {
      key: "waitlist",
      title: `候补 (${
        participants.filter((p) => p.status === "waitlist").length
      })`,
    },
    {
      key: "cancelled",
      title: `已取消 (${
        participants.filter((p) => p.status === "cancelled").length
      })`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate(`/activity/${id}`)}
        style={{
          "--height": "48px",
          "--border-bottom": "1px solid var(--adm-border-color)",
        }}
      >
        报名管理
      </NavBar>

      {/* 操作工具栏 */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex space-x-2 mb-3">
          <Button
            size="small"
            fill="outline"
            onClick={handleExcelImport}
            disabled={isUploading}
            style={{ "--border-radius": "8px", flex: 1 }}
          >
            <UploadOutline className="mr-1" />
            {isUploading ? "导入中..." : "导入Excel"}
          </Button>

          <Button
            size="small"
            fill="outline"
            onClick={handleExcelExport}
            style={{ "--border-radius": "8px", flex: 1 }}
          >
            <DownlandOutline className="mr-1" />
            导出Excel
          </Button>

          <Button
            size="small"
            color="primary"
            onClick={() => setShowNotificationModal(true)}
            style={{ "--border-radius": "8px", flex: 1 }}
          >
            <MessageOutline className="mr-1" />
            发送通知
          </Button>
        </div>

        {/* 上传进度 */}
        {isUploading && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              正在导入参与者数据... {uploadProgress}%
            </p>
          </div>
        )}

        {/* 搜索框 */}
        <SearchBar
          placeholder="搜索姓名、邮箱或手机号"
          value={searchText}
          onChange={setSearchText}
          style={{
            "--border-radius": "8px",
            "--background": "var(--adm-color-background)",
            "--height": "36px",
          }}
        />
      </div>

      {/* 状态筛选标签 */}
      <div className="bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            "--content-padding": "0",
            "--title-font-size": "14px",
          }}
        >
          {tabItems.map((item) => (
            <Tabs.Tab title={item.title} key={item.key} />
          ))}
        </Tabs>
      </div>

      {/* 参与者列表 */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <Empty
            description="暂无参与者"
            image="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20state%20illustration%20with%20users%20icon%20minimalist%20blue%20gray&image_size=square"
          />
        ) : (
          <List>
            {filteredParticipants.map((participant) => (
              <List.Item
                key={participant.user_id}
                prefix={
                  <Avatar
                    src={participant.avatar}
                    style={{ "--size": "48px" } as React.CSSProperties}
                    fallback={participant.name.charAt(0)}
                  />
                }
                extra={getStatusBadge(participant.status)}
                onClick={() => handleParticipantAction(participant)}
                arrow
              >
                <Card
                  className="mb-2 shadow-sm rounded-lg"
                  style={
                    {
                      "--body-padding": "12px",
                    } as React.CSSProperties
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {participant.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(
                            participant.user_id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants((prev) => [
                                ...prev,
                                participant.user_id,
                              ]);
                            } else {
                              setSelectedParticipants((prev) =>
                                prev.filter((id) => id !== participant.user_id)
                              );
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </div>
                    </div>

                    {participant.email && (
                      <div className="text-sm text-gray-600">
                        📧 {participant.email}
                      </div>
                    )}

                    {participant.phone && (
                      <div className="text-sm text-gray-600">
                        📱 {participant.phone}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>
                        报名时间：
                        {formatDateTime(participant.registration_time)}
                      </span>
                      <div className="flex space-x-1">
                        {participant.status === "confirmed" && (
                          <CheckCircleOutline className="text-green-500" />
                        )}
                        {participant.status === "cancelled" && (
                          <CloseCircleOutline className="text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            ))}
          </List>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* 发送通知弹窗 */}
      <Modal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="发送通知"
        content={
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {selectedParticipants.length > 0
                  ? `将发送给 ${selectedParticipants.length} 位选中的参与者`
                  : "将发送给所有参与者"}
              </p>
            </div>

            <TextArea
              placeholder="请输入通知内容..."
              value={notificationContent}
              onChange={setNotificationContent}
              maxLength={500}
              showCount
              rows={4}
              className="rounded-lg"
            />
          </div>
        }
        actions={[
          {
            key: "cancel",
            text: "取消",
            onClick: () => setShowNotificationModal(false),
          },
          {
            key: "send",
            text: "发送",
            primary: true,
            onClick: handleSendNotification,
          },
        ]}
      />

      {/* 统计信息 */}
      {participants.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              共 {participants.length} 人报名
            </span>
            <div className="flex space-x-4">
              <span className="text-green-600">
                已确认{" "}
                {participants.filter((p) => p.status === "confirmed").length}
              </span>
              <span className="text-yellow-600">
                候补{" "}
                {participants.filter((p) => p.status === "waitlist").length}
              </span>
              <span className="text-red-600">
                已取消{" "}
                {participants.filter((p) => p.status === "cancelled").length}
              </span>
            </div>
          </div>

          {selectedParticipants.length > 0 && (
            <div className="mt-2 text-center">
              <Tag color="primary" fill="outline">
                已选择 {selectedParticipants.length} 人
              </Tag>
            </div>
          )}
        </div>
      )}

      {/* 底部安全区域 */}
      <div className="h-20"></div>
    </div>
  );
};

export default EnrollmentManagement;
