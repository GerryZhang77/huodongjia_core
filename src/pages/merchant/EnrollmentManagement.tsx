/**
 * 报名管理页面 - 重构版
 *
 * 集成了新的筛选系统，支持：
 * - 多维度筛选（状态、性别、年龄、行业、标签、城市、自定义字段）
 * - 批量选择操作（全选、反选、清空）
 * - 导入/导出 Excel
 * - 发送通知
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  useNavigate,
  useParams } from "react-router-dom";
import {
  NavBar,
  Button,
  Card,
  List,
  Badge,
  ActionSheet,
  Tabs,
  TextArea,
  Modal,
  Tag,
  Empty,
  Checkbox,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import {
  UploadOutline,
  DownlandOutline,
  FilterOutline,
  MessageOutline,
  CheckCircleOutline,
  CloseCircleOutline,
} from "antd-mobile-icons";
import { useStore } from "@/store";
import type { Enrollment, FilterCriteria } from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA, STATUS_LABELS } from "@/types/enrollment";
import {
  calculateFilterOptions,
  applyFilters,
  selectAll,
  invertSelection,
  clearSelection,
  toggleSelection,
  isAllSelected,
  isIndeterminate,
  getActiveFilterCount,
} from "@/utils/enrollmentFilters";
import { EnrollmentFilterDrawer } from "@/components/business/EnrollmentFilterDrawer";
import { isDemoActivity } from "@/mocks/demo-activity";

const EnrollmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 原始报名数据（从 API 获取）
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选相关状态
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
    DEFAULT_FILTER_CRITERIA
  );
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 其他状态
  const [activeTab, setActiveTab] = useState("all");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 计算筛选选项（从报名数据中提取）
  const filterOptions = useMemo(() => {
    return calculateFilterOptions(enrollments);
  }, [enrollments]);

  // 应用筛选条件得到过滤后的数据
  const filteredEnrollments = useMemo(() => {
    let filtered = applyFilters(enrollments, filterCriteria);

    // 按 Tab 进一步过滤状态
    if (activeTab !== "all") {
      filtered = filtered.filter((e) => e.status === activeTab);
    }

    return filtered;
  }, [enrollments, filterCriteria, activeTab]);

  // 活跃筛选条件数量（用于徽章显示）
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filterCriteria);
  }, [filterCriteria]);

  // 按钮是否禁用（没有选中任何人时禁用）
  const isActionButtonDisabled = selectedIds.length === 0;

  // 全选状态
  const allSelected = useMemo(() => {
    return isAllSelected(filteredEnrollments, selectedIds);
  }, [filteredEnrollments, selectedIds]);

  // 部分选中状态
  const indeterminate = useMemo(() => {
    return isIndeterminate(filteredEnrollments, selectedIds);
  }, [filteredEnrollments, selectedIds]);

  // 获取报名列表（新 API）
  const fetchEnrollments = async () => {
    try {
      // 【Mock 环境】如果是演示活动，使用固定 ID 请求服务端报名数据
      const requestId = isDemoActivity(id)
        ? "00000000-0000-0000-0000-000000000000"
        : id;

      const isDemo = isDemoActivity(id);

      console.log(
        `📋 fetchEnrollments - 活动ID: ${id}, 请求ID: ${requestId}, 是否演示: ${isDemo}`
      );

      const response = await fetch(`/api/events/${requestId}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 【Mock 环境】演示活动的 404 错误静默处理
      if (!response.ok) {
        if (isDemo && response.status === 404) {
          console.log(
            "📋 fetchEnrollments - 演示活动报名数据未就绪（404），使用空列表"
          );
          setEnrollments([]);
          return;
        }

        // 非演示活动的错误，尝试解析错误信息
        try {
          const errorData = await response.json();
          Toast.show(errorData.message || `请求失败 (${response.status})`);
        } catch {
          Toast.show(`请求失败 (${response.status})`);
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log(
          `✅ fetchEnrollments - 成功获取 ${data.data?.length || 0} 条报名数据`
        );
        setEnrollments(data.data || []);
      } else {
        Toast.show(data.message || "获取报名列表失败");
      }
    } catch (error) {
      console.error("Fetch enrollments error:", error);

      // 【Mock 环境】演示活动的网络错误也静默处理
      if (!isDemoActivity(id)) {
        Toast.show("网络错误，请重试");
      } else {
        console.log("📋 fetchEnrollments - 演示活动请求失败，使用空列表");
        setEnrollments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      // 【Mock 环境】如果是演示活动，使用固定 ID
      const requestId = isDemoActivity(id)
        ? "00000000-0000-0000-0000-000000000000"
        : id!;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("activity_id", requestId);

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
        fetchEnrollments();
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
      // 【Mock 环境】如果是演示活动，使用固定 ID
      const requestId = isDemoActivity(id)
        ? "00000000-0000-0000-0000-000000000000"
        : id;

      const exportIds = selectedIds.length > 0 ? selectedIds : undefined;

      const response = await fetch(`/api/export-participants/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant_ids: exportIds,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participants_${id}_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        Toast.show(
          exportIds ? `导出 ${selectedIds.length} 人成功` : "导出成功"
        );
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
      // 【Mock 环境】如果是演示活动，使用固定 ID
      const requestId = isDemoActivity(id)
        ? "00000000-0000-0000-0000-000000000000"
        : id;

      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_id: requestId,
          participant_ids: selectedIds.length > 0 ? selectedIds : undefined,
          message: notificationContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show("通知发送成功");
        setShowNotificationModal(false);
        setNotificationContent("");
        setSelectedIds([]);
      } else {
        Toast.show(data.message || "发送失败");
      }
    } catch (error) {
      console.error("Send notification error:", error);
      Toast.show("发送失败，请重试");
    }
  };

  // 更新报名状态
  const updateEnrollmentStatus = async (
    enrollmentId: string,
    status: Enrollment["status"]
  ) => {
    try {
      const response = await fetch(
        `/api/events/${id}/enrollments/${enrollmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Toast.show("状态更新成功");
        fetchEnrollments();
      } else {
        Toast.show(data.message || "更新失败");
      }
    } catch (error) {
      console.error("Update status error:", error);
      Toast.show("更新失败，请重试");
    }
  };

  // 报名操作菜单
  const handleEnrollmentAction = (enrollment: Enrollment) => {
    ActionSheet.show({
      actions: [
        {
          text: "通过审核",
          key: "approve",
          onClick: () => updateEnrollmentStatus(enrollment.id, "approved"),
        },
        {
          text: "拒绝申请",
          key: "reject",
          danger: true,
          onClick: () => updateEnrollmentStatus(enrollment.id, "rejected"),
        },
        {
          text: "加入候补",
          key: "waitlist",
          onClick: () => updateEnrollmentStatus(enrollment.id, "waitlist"),
        },
      ],
      cancelText: "取消",
    });
  };

  // 批量操作：全选
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(clearSelection());
    } else {
      setSelectedIds(selectAll(filteredEnrollments));
    }
  };

  // 批量操作：反选
  const handleInvertSelection = () => {
    setSelectedIds(invertSelection(filteredEnrollments, selectedIds));
  };

  // 批量操作：清空
  const handleClearSelection = () => {
    setSelectedIds(clearSelection());
  };

  // 切换单个选择
  const handleToggleSelection = (enrollmentId: string) => {
    setSelectedIds(toggleSelection(enrollmentId, selectedIds));
  };

  // 状态标签配置
  const getStatusBadge = (status: Enrollment["status"]) => {
    const statusConfig: Record<
      Enrollment["status"],
      { text: string; color: "success" | "warning" | "danger" | "default" }
    > = {
      approved: { text: STATUS_LABELS.approved, color: "success" },
      pending: { text: STATUS_LABELS.pending, color: "warning" },
      rejected: { text: STATUS_LABELS.rejected, color: "danger" },
      waitlist: { text: STATUS_LABELS.waitlist, color: "default" },
      cancelled: { text: STATUS_LABELS.cancelled, color: "default" },
    };

    const config = statusConfig[status] || statusConfig.pending;
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
    { key: "all", title: `全部 (${enrollments.length})` },
    {
      key: "approved",
      title: `已通过 (${
        enrollments.filter((p) => p.status === "approved").length
      })`,
    },
    {
      key: "pending",
      title: `待审核 (${
        enrollments.filter((p) => p.status === "pending").length
      })`,
    },
    {
      key: "rejected",
      title: `已拒绝 (${
        enrollments.filter((p) => p.status === "rejected").length
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
            disabled={isActionButtonDisabled && selectedIds.length === 0}
            style={{ "--border-radius": "8px", flex: 1 }}
          >
            <DownlandOutline className="mr-1" />
            导出名单
          </Button>

          <Button
            size="small"
            color="primary"
            onClick={() => setShowNotificationModal(true)}
            disabled={isActionButtonDisabled}
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

        {/* 筛选按钮 */}
        <div className="flex items-center gap-2">
          <Button
            size="small"
            fill="outline"
            onClick={() => setShowFilterDrawer(true)}
            style={{ "--border-radius": "8px" }}
          >
            <FilterOutline className="mr-1" />
            筛选
            {activeFilterCount > 0 && (
              <Badge content={activeFilterCount} style={{ marginLeft: 4 }} />
            )}
          </Button>

          {selectedIds.length > 0 && (
            <>
              <Button
                size="small"
                fill="outline"
                onClick={handleSelectAll}
                style={{ "--border-radius": "8px" }}
              >
                {allSelected ? "取消全选" : "全选"}
              </Button>
              <Button
                size="small"
                fill="outline"
                onClick={handleInvertSelection}
                style={{ "--border-radius": "8px" }}
              >
                反选
              </Button>
              <Button
                size="small"
                fill="outline"
                onClick={handleClearSelection}
                style={{ "--border-radius": "8px" }}
              >
                清空
              </Button>
            </>
          )}
        </div>
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

      {/* 报名列表 */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <Empty description="暂无报名数据" />
        ) : (
          <div className="space-y-3">
            {/* 批量选择工具栏 */}
            {enrollments.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-white p-3 rounded-lg">
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                >
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {selectedIds.length > 0
                      ? `已选 ${selectedIds.length} 人`
                      : "全选"}
                  </span>
                </Checkbox>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  共 {filteredEnrollments.length} 人
                </span>
              </div>
            )}

            {/* 报名卡片列表 */}
            <List>
              {filteredEnrollments.map((enrollment) => (
                <List.Item
                  key={enrollment.id}
                  prefix={
                    <Checkbox
                      checked={selectedIds.includes(enrollment.id)}
                      onChange={() => handleToggleSelection(enrollment.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  onClick={() => handleEnrollmentAction(enrollment)}
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
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-gray-900 truncate min-w-0">
                          {enrollment.name}
                        </h3>
                        <div className="flex-shrink-0">
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>

                      {enrollment.email && (
                        <div className="text-sm text-gray-600 break-all">
                          📧 {enrollment.email}
                        </div>
                      )}

                      {enrollment.phone && (
                        <div className="text-sm text-gray-600 break-all">
                          📱 {enrollment.phone}
                        </div>
                      )}

                      {enrollment.city && (
                        <div className="text-sm text-gray-600 truncate">
                          📍 {enrollment.city}
                        </div>
                      )}

                      {/* 自定义字段显示 */}
                      {enrollment.customFields &&
                        Object.keys(enrollment.customFields).length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            {Object.entries(enrollment.customFields).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-sm text-gray-600 flex"
                                >
                                  <span className="font-medium mr-2">
                                    {key}:
                                  </span>
                                  <span>{String(value)}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="truncate min-w-0">
                          报名时间：{formatDateTime(enrollment.enrolledAt)}
                        </span>
                        <div className="flex space-x-1 flex-shrink-0">
                          {enrollment.status === "approved" && (
                            <CheckCircleOutline className="text-green-500" />
                          )}
                          {enrollment.status === "rejected" && (
                            <CloseCircleOutline className="text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              ))}
            </List>
          </div>
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

      {/* 筛选抽屉 */}
      <EnrollmentFilterDrawer
        visible={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filterOptions={filterOptions}
        criteria={filterCriteria}
        onCriteriaChange={setFilterCriteria}
        resultCount={filteredEnrollments.length}
        totalCount={enrollments.length}
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
                {selectedIds.length > 0
                  ? `将发送给 ${selectedIds.length} 位选中的参与者`
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
      {enrollments.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              共 {enrollments.length} 人报名
            </span>
            <div className="flex space-x-4">
              <span className="text-green-600">
                已通过{" "}
                {enrollments.filter((p) => p.status === "approved").length}
              </span>
              <span className="text-yellow-600">
                待审核{" "}
                {enrollments.filter((p) => p.status === "pending").length}
              </span>
              <span className="text-red-600">
                已拒绝{" "}
                {enrollments.filter((p) => p.status === "rejected").length}
              </span>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-2 text-center">
              <Tag color="primary" fill="outline">
                已选择 {selectedIds.length} 人
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
