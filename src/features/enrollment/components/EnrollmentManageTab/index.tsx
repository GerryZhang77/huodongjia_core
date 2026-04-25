/**
 * EnrollmentManageTab Component - 报名管理 Tab
 * 包含导入报名信息、筛选、发送通知、导出等功能
 */

// 🔥 临时修改：移除 useEffect（已注释掉自动加载逻辑）
import {
  FC,
  useState,
  useMemo } from "react";
import {
  Button,
  Card,
  Empty,
  List,
  Tag,
  Badge,
  Checkbox,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
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

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [total, setTotal] = useState(0); // 保留用于后端分页

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

  // 对筛选后的数据进行客户端分页
  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEnrollments.slice(startIndex, endIndex);
  }, [filteredEnrollments, currentPage, pageSize]);

  // 分页总数（基于筛选后的数据）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paginatedTotal = useMemo(() => {
    return filteredEnrollments.length;
  }, [filteredEnrollments]);

  // 活跃筛选条件数量
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filterCriteria);
  }, [filterCriteria]);

  // 全选状态（基于当前页的数据）
  const allSelected = useMemo(() => {
    return isAllSelected(paginatedEnrollments, selectedIds);
  }, [paginatedEnrollments, selectedIds]);

  // 部分选中状态
  const indeterminate = useMemo(() => {
    return isIndeterminate(paginatedEnrollments, selectedIds);
  }, [paginatedEnrollments, selectedIds]);

  // 加载报名列表（一次性加载所有数据，前端分页）
  const loadEnrollments = async () => {
    setLoading(true);
    try {
      // 不传分页参数，获取所有数据
      const response = await getEnrollmentsDetailed(activityId);
      if (response.success) {
        setEnrollments(response.enrollments || []);
        setTotal(response.total || 0);
      } else {
        Toast.show({
          icon: "fail",
          content: "加载报名列表失败",
        });
      }
    } catch (error) {
      console.error("加载报名列表失败:", error);

      // 🎯 演示活动的 404 错误静默处理（不显示 toast）
      const DEMO_ACTIVITY_ID = "act-pku-innovation-2025-fall";
      const isDemoActivity = activityId === DEMO_ACTIVITY_ID;
      const is404Error =
        (error as { response?: { status?: number } })?.response?.status === 404;

      if (isDemoActivity && is404Error) {
        console.log("✅ 演示活动暂无报名数据，已静默处理");
        setEnrollments([]);
        setTotal(0);
        return;
      }

      // 非演示活动或非 404 错误才显示 toast
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "加载失败",
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载（移除 currentPage 依赖，只加载一次）
  // 🔥 临时注释：Mock 生产环境专用 - 禁止自动加载报名数据
  // useEffect(() => {
  //   loadEnrollments();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activityId]);

  // 导入报名信息
  const handleImport = () => {
    setImportDialogVisible(true);
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    setImportDialogVisible(false);
    // 重置到第一页并刷新报名列表
    setCurrentPage(1);
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
    setCurrentPage(1); // 重置到第一页
  };

  // 全选/取消全选（当前页）
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(clearSelection());
    } else {
      setSelectedIds(selectAll(paginatedEnrollments));
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
                {import.meta.env.VITE_PRODUCTION_MODE === "true" ? (
                  // 生产模式：全部显示为已通过
                  <Tag color="success">已通过 {filteredEnrollments.length}</Tag>
                ) : (
                  // 开发模式：显示真实统计
                  <>
                    <Tag color="success">
                      通过{" "}
                      {
                        filteredEnrollments.filter(
                          (e) => e.status === "approved"
                        ).length
                      }
                    </Tag>
                    <Tag color="warning">
                      待审核{" "}
                      {
                        filteredEnrollments.filter(
                          (e) => e.status === "pending"
                        ).length
                      }
                    </Tag>
                    <Tag color="danger">
                      拒绝{" "}
                      {
                        filteredEnrollments.filter(
                          (e) => e.status === "rejected"
                        ).length
                      }
                    </Tag>
                  </>
                )}
              </div>
            </div>

            {/* 全选工具栏 */}
            {paginatedEnrollments.length > 0 && (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-3 border border-gray-200">
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                >
                  <span className="text-sm text-gray-600">
                    {selectedIds.length > 0
                      ? `已选 ${selectedIds.length} 人`
                      : "全选当前页"}
                  </span>
                </Checkbox>
                <span className="text-sm text-gray-500">
                  当前页 {paginatedEnrollments.length} 人 / 共{" "}
                  {filteredEnrollments.length} 人
                </span>
              </div>
            )}

            {/* 报名列表 */}
            <Card className="rounded-xl overflow-hidden">
              <List>
                {paginatedEnrollments.map((enrollment) => (
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
                      <div className="space-y-1.5">
                        {/* 基础信息行 */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {enrollment.gender &&
                            enrollment.gender !== "other" && (
                              <span>
                                {enrollment.gender === "male"
                                  ? "👨 男"
                                  : enrollment.gender === "female"
                                  ? "👩 女"
                                  : null}
                              </span>
                            )}
                          {enrollment.age && <span>{enrollment.age}岁</span>}
                          {enrollment.occupation && (
                            <span>{enrollment.occupation}</span>
                          )}
                        </div>

                        {/* 公司/行业信息 */}
                        {(enrollment.company || enrollment.industry) && (
                          <div className="text-sm text-gray-600">
                            {[enrollment.company, enrollment.industry]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}

                        {/* 联系方式 */}
                        {(enrollment.phone || enrollment.email) && (
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            {enrollment.phone && (
                              <span>📱 {enrollment.phone}</span>
                            )}
                            {enrollment.email && (
                              <span>📧 {enrollment.email}</span>
                            )}
                          </div>
                        )}

                        {/* 城市信息 */}
                        {enrollment.city && (
                          <div className="text-xs text-gray-500">
                            📍 {enrollment.city}
                          </div>
                        )}

                        {/* 自定义字段标签 */}
                        {enrollment.customFields &&
                          Object.keys(enrollment.customFields).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(enrollment.customFields)
                                .filter(([key, value]) => {
                                  // 过滤掉已经单独展示的字段和内部字段
                                  const excludedKeys = [
                                    "phone",
                                    "手机号",
                                    "联系方式",
                                    "email",
                                    "邮箱",
                                    "电子邮箱",
                                    "company",
                                    "公司",
                                    "单位",
                                    "industry",
                                    "行业",
                                    "city",
                                    "城市",
                                    "所在地",
                                    "other", // 过滤内部字段
                                    "sex",
                                    "性别",
                                    "年龄",
                                    "age",
                                    "name",
                                    "姓名",
                                    "status",
                                    "状态",
                                    "index", // 过滤索引字段
                                    "序号",
                                    "id",
                                    "ID",
                                  ];

                                  // 过滤掉排除的键
                                  if (excludedKeys.includes(key)) {
                                    return false;
                                  }

                                  // 过滤掉空值、null、undefined
                                  if (
                                    value === null ||
                                    value === undefined ||
                                    value === ""
                                  ) {
                                    return false;
                                  }

                                  // 转换为字符串并清理
                                  const stringValue = String(value)
                                    .trim()
                                    .toLowerCase();

                                  // 过滤掉纯数字（如 "59", "60"）
                                  if (/^\d+$/.test(stringValue)) {
                                    return false;
                                  }

                                  // 过滤掉无意义的值
                                  const excludedValues = [
                                    "other",
                                    "null",
                                    "undefined",
                                    "nan",
                                    "none",
                                    "无",
                                    "空",
                                  ];
                                  if (excludedValues.includes(stringValue)) {
                                    return false;
                                  }

                                  return true;
                                })
                                .slice(0, 3) // 只显示前3个额外字段
                                .map(([key, value]) => {
                                  // 如果值是对象或数组，转换为字符串
                                  const displayValue =
                                    typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value);

                                  return (
                                    <Tag
                                      key={key}
                                      color="primary"
                                      fill="outline"
                                      className="text-xs"
                                    >
                                      {displayValue.length > 10
                                        ? displayValue.substring(0, 10) + "..."
                                        : displayValue}
                                    </Tag>
                                  );
                                })}
                            </div>
                          )}
                      </div>
                    }
                    extra={
                      import.meta.env.VITE_PRODUCTION_MODE === "true" ? (
                        // 生产模式：强制显示"已通过"
                        <Tag color="success">已通过</Tag>
                      ) : (
                        // 开发模式：显示真实状态
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
                      )
                    }
                  >
                    <div className="font-medium text-gray-900">
                      {enrollment.name}
                    </div>
                  </List.Item>
                ))}
              </List>
            </Card>

            {/* 分页器 */}
            {filteredEnrollments.length > pageSize && (
              <div className="flex justify-center items-center gap-4 py-4 mt-4">
                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="rounded-lg"
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-600">
                  第 {currentPage} 页 / 共{" "}
                  {Math.ceil(filteredEnrollments.length / pageSize)} 页
                </span>
                <Button
                  size="small"
                  disabled={
                    currentPage >=
                    Math.ceil(filteredEnrollments.length / pageSize)
                  }
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="rounded-lg"
                >
                  下一页
                </Button>
              </div>
            )}
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
