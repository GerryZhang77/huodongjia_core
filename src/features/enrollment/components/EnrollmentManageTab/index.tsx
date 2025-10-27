/**
 * EnrollmentManageTab Component - 报名管理 Tab
 * 包含导入报名信息、筛选、发送通知、导出等功能
 */

import { FC, useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Empty,
  List,
  Tag,
  Toast,
  Badge,
  Checkbox,
} from "antd-mobile";
import {
  AddCircleOutline,
  FileOutline,
  SearchOutline,
  SendOutline,
  CloseCircleOutline,
} from "antd-mobile-icons";
import { ImportEnrollmentDialog } from "../ImportEnrollmentDialog";
import { SendNotificationDialog } from "../SendNotificationDialog";
import {
  getEnrollmentsDetailed,
  sendEnrollmentNotification,
} from "../../services/enrollmentApi";
import type { Enrollment, NotificationType } from "../../types";
import { EnrollmentFilterDrawer } from "@/components/business/EnrollmentFilterDrawer";
import {
  calculateFilterOptions,
  applyFilters,
  getActiveFilterCount,
  toggleSelection,
  selectAll,
  clearSelection,
  isAllSelected,
  isIndeterminate,
} from "@/utils/enrollmentFilters";
import type { FilterCriteria } from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA } from "@/types/enrollment";
import { exportSelectedEnrollments } from "@/utils/excelExport";

/**
 * 组件 Props
 */
export interface EnrollmentManageTabProps {
  activityId: string;
}

/**
 * 报名管理 Tab 组件
 */
export const EnrollmentManageTab: FC<EnrollmentManageTabProps> = ({
  activityId,
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [notificationDialogVisible, setNotificationDialogVisible] =
    useState(false);

  // 筛选相关状态
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
    DEFAULT_FILTER_CRITERIA
  );

  // 选择相关状态
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 计算筛选选项
  const filterOptions = useMemo(() => {
    return calculateFilterOptions(enrollments);
  }, [enrollments]);

  // 应用筛选后的数据
  const filteredEnrollments = useMemo(() => {
    return applyFilters(enrollments, filterCriteria);
  }, [enrollments, filterCriteria]);

  // 活跃筛选条件数量
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filterCriteria);
  }, [filterCriteria]);

  // 全选状态
  const allSelected = useMemo(() => {
    return isAllSelected(filteredEnrollments, selectedIds);
  }, [filteredEnrollments, selectedIds]);

  // 部分选中状态
  const indeterminate = useMemo(() => {
    return isIndeterminate(filteredEnrollments, selectedIds);
  }, [filteredEnrollments, selectedIds]);

  // 加载报名列表
  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const response = await getEnrollmentsDetailed(activityId);
      if (response.success) {
        setEnrollments(response.enrollments || []);
      } else {
        Toast.show({
          icon: "fail",
          content: "加载报名列表失败",
        });
      }
    } catch (error) {
      console.error("加载报名列表失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "加载失败",
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  // 导入报名信息
  const handleImport = () => {
    setImportDialogVisible(true);
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    setImportDialogVisible(false);
    // 刷新报名列表
    loadEnrollments();
    Toast.show({
      icon: "success",
      content: "导入成功，列表已刷新",
    });
  };

  // 筛选报名信息
  const handleFilter = () => {
    setShowFilterDrawer(true);
  };

  // 取消筛选
  const handleCancelFilter = () => {
    setFilterCriteria(DEFAULT_FILTER_CRITERIA);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(clearSelection());
    } else {
      setSelectedIds(selectAll(filteredEnrollments));
    }
  };

  // 切换单个选择
  const handleToggleSelection = (enrollmentId: string) => {
    setSelectedIds(toggleSelection(enrollmentId, selectedIds));
  };

  // 发送通知
  const handleNotify = () => {
    setNotificationDialogVisible(true);
  };

  // 确认发送通知
  const handleConfirmNotification = async (
    type: NotificationType,
    title: string,
    content: string
  ) => {
    try {
      // 获取选中的完整报名信息
      const selectedEnrollments = enrollments.filter((e) =>
        selectedIds.includes(e.id)
      );

      // 准备报名基本信息
      const enrollmentInfo = selectedEnrollments.map((e) => ({
        id: e.id,
        name: e.name,
        phone: e.phone || "",
        email: e.email || "",
      }));

      // 调用通知API
      await sendEnrollmentNotification({
        activityId: activityId,
        enrollmentIds: selectedIds,
        type,
        title,
        content,
        enrollments: enrollmentInfo,
        activityInfo: {
          id: activityId,
          title: "", // 需要从父组件传入或从状态获取
          startTime: "",
          location: "",
        },
      });

      Toast.show({
        icon: "success",
        content: `成功向 ${selectedIds.length} 人发送通知`,
      });

      // 清空选择
      setSelectedIds([]);
    } catch (error) {
      console.error("发送通知失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "发送失败",
      });
    }
  };

  // 导出名单
  const handleExport = () => {
    try {
      exportSelectedEnrollments(enrollments, selectedIds, "活动报名名单");

      Toast.show({
        icon: "success",
        content: `成功导出 ${selectedIds.length} 条记录`,
      });
    } catch (error) {
      console.error("导出失败:", error);
      Toast.show({
        icon: "fail",
        content: "导出失败，请重试",
      });
    }
  };

  return (
    <div className="pb-20">
      {/* 功能按钮区 */}
      <div className="bg-white p-5 md:px-8 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <Button
            color="primary"
            fill="outline"
            size="large"
            onClick={handleImport}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <AddCircleOutline />
              <span>导入报名</span>
            </div>
          </Button>

          <Button
            color="primary"
            fill="outline"
            size="large"
            onClick={handleFilter}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <SearchOutline />
              <span>筛选</span>
              {activeFilterCount > 0 && <Badge content={activeFilterCount} />}
            </div>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button
            color="success"
            fill="outline"
            size="large"
            onClick={handleNotify}
            disabled={selectedIds.length === 0}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <SendOutline />
              <span>发送通知</span>
            </div>
          </Button>

          <Button
            color="default"
            fill="outline"
            size="large"
            onClick={handleExport}
            disabled={selectedIds.length === 0}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <FileOutline />
              <span>导出名单</span>
            </div>
          </Button>
        </div>
      </div>

      {/* 报名列表 */}
      <div className="px-5 md:px-8 py-4">
        {/* 加载中 */}
        {loading && enrollments.length === 0 ? (
          <Card className="rounded-xl">
            <div className="py-12 text-center text-gray-500">加载中...</div>
          </Card>
        ) : /* 空态 */ enrollments.length === 0 ? (
          <Card className="rounded-xl">
            <div className="py-12">
              <Empty
                description="暂无报名信息"
                imageStyle={{ width: 100 }}
                className="mb-4"
              />
              <div className="text-center">
                <Button
                  color="primary"
                  onClick={handleImport}
                  className="rounded-lg"
                >
                  导入报名信息
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* 统计信息 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  {activeFilterCount > 0 ? "筛选结果" : "报名名单"} (
                  {filteredEnrollments.length} / {enrollments.length})
                </h3>
                {activeFilterCount > 0 && (
                  <Button
                    size="mini"
                    fill="none"
                    color="primary"
                    onClick={handleCancelFilter}
                    className="flex items-center gap-1"
                  >
                    <CloseCircleOutline fontSize={14} />
                    <span className="text-xs">取消筛选</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tag color="success">
                  通过{" "}
                  {
                    filteredEnrollments.filter((e) => e.status === "approved")
                      .length
                  }
                </Tag>
                <Tag color="warning">
                  待审核{" "}
                  {
                    filteredEnrollments.filter((e) => e.status === "pending")
                      .length
                  }
                </Tag>
                <Tag color="danger">
                  拒绝{" "}
                  {
                    filteredEnrollments.filter((e) => e.status === "rejected")
                      .length
                  }
                </Tag>
              </div>
            </div>

            {/* 全选工具栏 */}
            {filteredEnrollments.length > 0 && (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-3 border border-gray-200">
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                >
                  <span className="text-sm text-gray-600">
                    {selectedIds.length > 0
                      ? `已选 ${selectedIds.length} 人`
                      : "全选"}
                  </span>
                </Checkbox>
                <span className="text-sm text-gray-500">
                  共 {filteredEnrollments.length} 人
                </span>
              </div>
            )}

            {/* 报名列表 */}
            <Card className="rounded-xl overflow-hidden">
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
                    description={
                      <div className="space-y-1">
                        {/* 基础信息 */}
                        <div className="text-sm text-gray-600">
                          {[
                            enrollment.gender === "male"
                              ? "男"
                              : enrollment.gender === "female"
                              ? "女"
                              : enrollment.gender,
                            enrollment.age && `${enrollment.age}岁`,
                            enrollment.occupation,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>

                        {/* 联系方式 */}
                        {(enrollment.phone || enrollment.email) && (
                          <div className="text-xs text-gray-500">
                            {[enrollment.phone, enrollment.email]
                              .filter(Boolean)
                              .join(" | ")}
                          </div>
                        )}

                        {/* 自定义字段 */}
                        {enrollment.customFields &&
                          Object.keys(enrollment.customFields).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(enrollment.customFields).map(
                                ([key, value]) => (
                                  <Tag
                                    key={key}
                                    color="default"
                                    fill="outline"
                                    className="text-xs"
                                  >
                                    {key}: {String(value)}
                                  </Tag>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    }
                    extra={
                      <Tag
                        color={
                          enrollment.status === "approved"
                            ? "success"
                            : enrollment.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {enrollment.status === "approved"
                          ? "已通过"
                          : enrollment.status === "rejected"
                          ? "已拒绝"
                          : "待审核"}
                      </Tag>
                    }
                  >
                    <div className="font-medium text-gray-900">
                      {enrollment.name}
                    </div>
                  </List.Item>
                ))}
              </List>
            </Card>
          </>
        )}
      </div>

      {/* 导入报名信息对话框 */}
      <ImportEnrollmentDialog
        visible={importDialogVisible}
        activityId={activityId}
        onClose={() => setImportDialogVisible(false)}
        onSuccess={handleImportSuccess}
      />

      {/* 发送通知对话框 */}
      <SendNotificationDialog
        visible={notificationDialogVisible}
        recipientCount={selectedIds.length}
        onClose={() => setNotificationDialogVisible(false)}
        onConfirm={handleConfirmNotification}
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
    </div>
  );
};
