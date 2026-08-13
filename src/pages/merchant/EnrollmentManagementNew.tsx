/**
 * 报名管理页面 (新版)
 *
 * 改进点：
 * 1. 选择模式：点击卡片进入详情，长按或点击「选择」按钮进入多选模式
 * 2. 选中样式：整卡高亮 + 角标勾选，视觉更直观
 * 3. 用户详情：底部/右侧 Drawer 展示完整信息
 * 4. 筛选面板：PC端右侧面板，移动端底部抽屉
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "antd-mobile";
import {
  Users,
  Upload,
  Download,
  Filter,
  Send,
  Search,
  Loader2,
  Check,
  Repeat,
  ListChecks,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  QrCode,
  Settings,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { MerchantLayout } from "@/components/layout";
import {
  ImportEnrollmentModal,
  SendNotificationModal,
  ExportEnrollmentModal,
  RegistrationQrModal,
  FilterDrawer,
  EnrollmentDetailDrawer,
} from "@/components/enrollment";
import {
  prefetchEnrollmentImages,
  useUpdateEnrollmentStatus,
} from "@/features/enrollment/hooks";
import { useAuthStore } from "@/features/auth/stores";
import type {
  Enrollment,
  FilterCriteria,
  FilterOptions,
} from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA, STATUS_LABELS } from "@/types/enrollment";
import {
  calculateFilterOptions,
  applyFilters,
  getActiveFilterCount,
} from "@/utils/enrollmentFilters";
import { useActivityDetail } from "@/features/activities/hooks/useActivityDetail";
import { getEnrollmentsDetailed } from "@/features/enrollment/services/enrollmentApi";
import {
  requestEnrollmentUpdate,
  reviewEnrollmentChanges,
} from "@/services/enrollmentApi";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";
import EnrollmentStatisticsDashboard from "@/features/enrollment/components/EnrollmentStatisticsDashboard";

/**
 * 状态标签颜色映射
 */
const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-yellow-600",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

// ========================================
// EnrollmentCard 子组件（改进选择体验）
// ========================================

interface EnrollmentCardProps {
  enrollment: Enrollment;
  selected: boolean;
  /** 是否处于多选模式 */
  selectionMode: boolean;
  /** 选择切换 */
  onSelect: () => void;
  /** 点击查看详情 */
  onViewDetail: () => void;
  /** 长按进入选择模式 */
  onLongPress: () => void;
  /** 有私有图片时，在打开详情前预取。 */
  onPrefetchImages?: () => void;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  selected,
  selectionMode,
  onSelect,
  onViewDetail,
  onLongPress,
  onPrefetchImages,
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  const handlePointerDown = () => {
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      onLongPress();
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (isLongPressing.current) {
      isLongPressing.current = false;
      return;
    }
    if (selectionMode) {
      onSelect();
    } else {
      onViewDetail();
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border p-4 transition-all cursor-pointer select-none ${
        selected
          ? "border-primary-400 bg-primary-50/40 ring-1 ring-primary-200"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={onPrefetchImages}
      onFocus={onPrefetchImages}
      tabIndex={0}
      role="button"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 选中角标 */}
      {(selectionMode || selected) && (
        <div
          className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
            selected
              ? "bg-primary-400 shadow-sm shadow-primary-200"
              : "bg-white border-2 border-gray-300"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {selected && <Check size={14} className="text-white" />}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 font-medium text-sm">
            {enrollment.name.slice(0, 1)}
          </span>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {enrollment.name}
            </span>
            {(enrollment.isExternal || !enrollment.userId) && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-orange-100 text-orange-600">外部</span>
            )}
            {enrollment.registrationTypeName && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-600">
                {enrollment.registrationTypeName}
              </span>
            )}
            {!!enrollment.imageCount && (
              <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded bg-purple-50 px-1.5 py-0.5 text-xs tabular-nums text-purple-600">
                <ImageIcon size={11} />
                {enrollment.imageCount}
              </span>
            )}
            {enrollment.hasUnreviewedChanges && (
              <span className="whitespace-nowrap rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                资料有更新
              </span>
            )}
            {enrollment.updateRequired && (
              <span className="whitespace-nowrap rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                待用户补充
              </span>
            )}
            <span
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${statusColors[enrollment.status] || "bg-gray-100 text-gray-500"}`}
            >
              {STATUS_LABELS[enrollment.status] || enrollment.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 space-x-3">
            {enrollment.gender && (
              <span>
                {enrollment.gender === "male"
                  ? "男"
                  : enrollment.gender === "female"
                    ? "女"
                    : "其他"}
              </span>
            )}
            {enrollment.age && <span>{enrollment.age}岁</span>}
            {enrollment.industry && <span>{enrollment.industry}</span>}
          </div>
          {enrollment.tags && enrollment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {enrollment.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="max-w-full truncate whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {enrollment.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{enrollment.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 右侧箭头（非选择模式才显示） */}
        {!selectionMode && (
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-2 transition-colors"
          />
        )}
      </div>
    </div>
  );
};

// ========================================
// PC 端内联筛选面板
// ========================================

const PCFilterChip: React.FC<{
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}> = ({ label, count, selected, onClick }) => (
  <button
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
      selected
        ? "bg-primary-400 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    <span>{label}</span>
    <span className={`${selected ? "text-white/70" : "text-gray-400"}`}>
      {count}
    </span>
  </button>
);

const PCFilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  selectedCount?: number;
}> = ({ title, children, selectedCount }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-50 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-medium text-gray-700">
          {title}
          {selectedCount !== undefined && selectedCount > 0 && (
            <span className="ml-1 text-xs text-primary-400 font-normal">
              ({selectedCount})
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="pb-2.5 flex flex-wrap gap-1.5">{children}</div>
      )}
    </div>
  );
};

interface PCFilterPanelProps {
  filterOptions: FilterOptions;
  filterCriteria: FilterCriteria;
  onChange: (criteria: FilterCriteria) => void;
  onReset: () => void;
  activeCount: number;
}

const PCFilterPanel: React.FC<PCFilterPanelProps> = ({
  filterOptions,
  filterCriteria,
  onChange,
  onReset,
  activeCount,
}) => {
  const toggleFilter = (
    field: "gender" | "city" | "industry" | "ageGroup" | "tags",
    value: string,
  ) => {
    const currentValues = filterCriteria[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onChange({ ...filterCriteria, [field]: newValues });
  };

  const toggleCustomFilter = (fieldName: string, value: string) => {
    const currentValues = filterCriteria.customFields[fieldName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onChange({
      ...filterCriteria,
      customFields: { ...filterCriteria.customFields, [fieldName]: newValues },
    });
  };

  // 构建可用维度
  type SectionDef = {
    key: string;
    title: string;
    type: "standard" | "custom";
  };
  const sections: SectionDef[] = [];

  if (filterOptions.gender.length > 0)
    sections.push({ key: "gender", title: "性别", type: "standard" });
  if (filterOptions.city.length > 0)
    sections.push({ key: "city", title: "城市", type: "standard" });
  if (filterOptions.industry.length > 0)
    sections.push({ key: "industry", title: "行业", type: "standard" });
  if (filterOptions.ageGroup.length > 0)
    sections.push({ key: "ageGroup", title: "年龄段", type: "standard" });
  if (filterOptions.tags.length > 0)
    sections.push({ key: "tags", title: "标签", type: "standard" });

  Object.keys(filterOptions.customFields).forEach((fieldName) => {
    if (filterOptions.customFields[fieldName].length > 0) {
      sections.push({
        key: `custom_${fieldName}`,
        title: fieldName,
        type: "custom",
      });
    }
  });

  const getSelectedCount = (sectionKey: string): number => {
    if (sectionKey.startsWith("custom_")) {
      const fieldName = sectionKey.replace("custom_", "");
      return (filterCriteria.customFields[fieldName] || []).length;
    }
    const field = sectionKey as keyof FilterCriteria;
    const val = filterCriteria[field];
    return Array.isArray(val) ? val.length : 0;
  };

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="px-4 py-2">
        {sections.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-6">
            暂无可用的筛选维度
          </p>
        ) : (
          sections.map((section) => (
            <PCFilterSection
              key={section.key}
              title={section.title}
              selectedCount={getSelectedCount(section.key)}
            >
              {section.type === "standard"
                ? (
                    filterOptions[
                      section.key as
                        | "gender"
                        | "city"
                        | "industry"
                        | "ageGroup"
                        | "tags"
                    ] as Array<{ value: string; label: string; count: number }>
                  ).map((opt) => (
                    <PCFilterChip
                      key={opt.value}
                      label={opt.label}
                      count={opt.count}
                      selected={(
                        filterCriteria[
                          section.key as
                            | "gender"
                            | "city"
                            | "industry"
                            | "ageGroup"
                            | "tags"
                        ] as string[]
                      ).includes(opt.value)}
                      onClick={() =>
                        toggleFilter(
                          section.key as
                            | "gender"
                            | "city"
                            | "industry"
                            | "ageGroup"
                            | "tags",
                          opt.value,
                        )
                      }
                    />
                  ))
                : (
                    filterOptions.customFields[
                      section.key.replace("custom_", "")
                    ] || []
                  ).map((opt) => (
                    <PCFilterChip
                      key={opt.value}
                      label={opt.label}
                      count={opt.count}
                      selected={(
                        filterCriteria.customFields[
                          section.key.replace("custom_", "")
                        ] || []
                      ).includes(opt.value)}
                      onClick={() =>
                        toggleCustomFilter(
                          section.key.replace("custom_", ""),
                          opt.value,
                        )
                      }
                    />
                  ))}
            </PCFilterSection>
          ))
        )}
      </div>

      {/* 底部操作 */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <button
          className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-gray-500 transition-colors hover:text-gray-700 [&>svg]:shrink-0"
          onClick={onReset}
        >
          <RotateCcw size={12} />
          重置
        </button>
        {activeCount > 0 && (
          <span className="text-xs text-primary-400">
            {activeCount} 个筛选项
          </span>
        )}
      </div>
    </div>
  );
};

// ========================================
// 主页面组件
// ========================================

const EnrollmentManagementNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionScope = useAuthStore((state) => state.user?.id || "anonymous");
  const queryClient = useQueryClient();
  const { updateStatus } = useUpdateEnrollmentStatus(id || "");
  const { activity } = useActivityDetail(id);
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ||
    (id ? `/dashboard/activity/${id}/detail` : "/dashboard");
  const enrollmentPath = id ? `/dashboard/activity/${id}/enrollment` : "/dashboard";

  const enrollmentQuery = useQuery({
    queryKey: merchantQueryKeys.enrollmentList(id),
    queryFn: () => getEnrollmentsDetailed(id!, { page: 1, pageSize: 1000 }),
    enabled: Boolean(id),
    staleTime: merchantCacheTimes.enrollmentStale,
    gcTime: merchantCacheTimes.enrollmentGc,
  });
  const enrollments = useMemo(
    () => (enrollmentQuery.data?.enrollments ?? []) as Enrollment[],
    [enrollmentQuery.data?.enrollments],
  );
  const loading = enrollmentQuery.isPending;

  // 筛选
  const filterStorageKey = `merchant-enrollment-filters:${id || "unknown"}`;
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(() => {
    try {
      const saved = sessionStorage.getItem(filterStorageKey);
      return saved ? JSON.parse(saved) : DEFAULT_FILTER_CRITERIA;
    } catch {
      return DEFAULT_FILTER_CRITERIA;
    }
  });
  const [searchKeyword, setSearchKeyword] = useState(
    () => searchParams.get("q") || "",
  );
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("status") || "all",
  );
  const [managementView, setManagementView] = useState<"list" | "statistics">(
    () => searchParams.get("view") === "statistics" ? "statistics" : "list",
  );

  // 分页
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(() => {
    const parsed = Number(searchParams.get("page"));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  });

  useEffect(() => {
    sessionStorage.setItem(filterStorageKey, JSON.stringify(filterCriteria));
  }, [filterCriteria, filterStorageKey]);

  useEffect(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (searchKeyword) next.set("q", searchKeyword);
        else next.delete("q");
        if (activeTab !== "all") next.set("status", activeTab);
        else next.delete("status");
        if (currentPage > 1) next.set("page", String(currentPage));
        else next.delete("page");
        if (managementView === "statistics") next.set("view", "statistics");
        else next.delete("view");
        return next;
      },
      { replace: true },
    );
  }, [activeTab, currentPage, managementView, searchKeyword, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterCriteria, searchKeyword]);

  // 选择模式
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 详情抽屉
  const [detailEnrollment, setDetailEnrollment] = useState<Enrollment | null>(
    null,
  );
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Modal / Drawer 状态
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 计算筛选选项
  const filterOptions = useMemo(() => {
    return calculateFilterOptions(enrollments);
  }, [enrollments]);

  // 应用筛选
  const filteredEnrollments = useMemo(() => {
    let filtered = applyFilters(enrollments, filterCriteria);

    if (activeTab !== "all") {
      filtered = filtered.filter((e) => e.status === activeTab);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(keyword) ||
          e.tags?.some((t) => t.toLowerCase().includes(keyword)) ||
          e.registrationTypeName?.toLowerCase().includes(keyword),
      );
    }

    return filtered;
  }, [enrollments, filterCriteria, activeTab, searchKeyword]);

  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filterCriteria);
  }, [filterCriteria]);

  // ====== 选择操作 ======

  const toggleSelect = useCallback((enrollmentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((eid) => eid !== enrollmentId)
        : [...prev, enrollmentId],
    );
  }, []);

  const enterSelectionMode = useCallback(
    (firstId?: string) => {
      setSelectionMode(true);
      if (firstId && !selectedIds.includes(firstId)) {
        setSelectedIds((prev) => [...prev, firstId]);
      }
    },
    [selectedIds],
  );

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const selectAll = () => {
    setSelectedIds(filteredEnrollments.map((e) => e.id));
  };

  // ====== 详情操作 ======

  const handleViewDetail = useCallback(
    (enrollment: Enrollment) => {
      if (selectionMode) return;
      setDetailEnrollment(enrollment);
      setShowDetailDrawer(true);
    },
    [selectionMode],
  );

  // ====== 审核操作 ======

  const handleApprove = (enrollmentId: string) => {
    updateStatus([enrollmentId], "approved", () => {
      setShowDetailDrawer(false);
    });
  };

  const handleReject = async (enrollmentId: string) => {
    const confirmed = await Dialog.confirm({
      title: "结束报名审核",
      content:
        "结束审核后会立即释放该报名占用的名额，不会向用户发送站内通知或短信。用户端仅显示“审核结束”，且不能重新提交。",
      confirmText: "确认结束",
      cancelText: "取消",
    });
    if (!confirmed) return;
    updateStatus(
      [enrollmentId],
      "rejected",
      () => {
        setShowDetailDrawer(false);
      },
      { notificationPolicy: "silent" },
    );
  };

  const handleCancel = async (enrollmentId: string) => {
    const confirmed = await Dialog.confirm({
      title: "取消报名？",
      content: "将释放 1 个名额，用户端显示“已取消”。",
      confirmText: "确认取消",
      cancelText: "返回",
    });
    if (!confirmed) return;
    updateStatus(
      [enrollmentId],
      "cancelled",
      () => {
        setShowDetailDrawer(false);
      },
      { notificationPolicy: "silent" },
    );
  };

  const refreshDetailEnrollment = async (enrollmentId: string) => {
    const refreshed = await enrollmentQuery.refetch();
    const next = refreshed.data?.enrollments?.find(
      (enrollment) => enrollment.id === enrollmentId,
    );
    if (next) setDetailEnrollment(next);
  };

  const handleRequestEnrollmentUpdate = async (
    enrollmentId: string,
    fieldKeys: string[],
    note?: string,
  ) => {
    if (!id) return;
    try {
      const result = await requestEnrollmentUpdate(id, enrollmentId, { fieldKeys, note });
      const notificationStatus = result.data?.notificationStatus;
      Toast.show({
        icon: notificationStatus === "failed" || notificationStatus === "external" ? "fail" : "success",
        content:
          notificationStatus === "sent"
            ? "补充任务已创建，站内通知已投递"
            : notificationStatus === "muted"
              ? "补充任务已创建；用户开启了免打扰"
              : notificationStatus === "external"
                ? "补充任务已创建，但该用户暂无平台账号"
                : notificationStatus === "failed"
                  ? "补充任务已创建，但站内通知发送失败"
                  : "补充任务已创建",
      });
      await refreshDetailEnrollment(enrollmentId);
    } catch (error) {
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "发送更新要求失败",
      });
      throw error;
    }
  };

  const handleReviewEnrollmentChanges = async (enrollmentId: string) => {
    if (!id) return;
    try {
      await reviewEnrollmentChanges(id, enrollmentId);
      Toast.show({ icon: "success", content: "已标记为查看" });
      await refreshDetailEnrollment(enrollmentId);
    } catch (error) {
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "操作失败",
      });
    }
  };

  const handleBatchApprove = () => {
    const ids = [...selectedIds];
    updateStatus(ids, "approved", () => {
      exitSelectionMode();
    });
  };

  const handleBatchReject = async () => {
    const ids = [...selectedIds];
    const confirmed = await Dialog.confirm({
      title: `结束 ${ids.length} 条报名审核`,
      content:
        "结束审核后会立即释放其中仍占用的名额，不会向这些用户发送站内通知或短信。用户端仅显示“审核结束”，且不能重新提交。",
      confirmText: "确认结束",
      cancelText: "取消",
    });
    if (!confirmed) return;
    updateStatus(
      ids,
      "rejected",
      () => {
        exitSelectionMode();
      },
      { notificationPolicy: "silent" },
    );
  };

  // ====== 导入导出 ======

  const handleImportSuccess = (count: number) => {
    void enrollmentQuery.refetch();
    Toast.show({ content: `成功导入 ${count} 条数据` });
  };

  const handleSendNotification = () => {
    setShowNotifyModal(true);
  };

  const handleBack = () => {
    navigate(returnTo);
  };

  const handleGoMatching = () => {
    if (!id) return;
    navigate(`/dashboard/activity/${id}/matching`, {
      state: { returnTo: enrollmentPath, enrollmentReturnTo: returnTo },
    });
  };

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: enrollments.length,
      pending: enrollments.filter((e) => e.status === "pending").length,
      approved: enrollments.filter((e) => e.status === "approved").length,
      rejected: enrollments.filter((e) => e.status === "rejected").length,
    };
  }, [enrollments]);

  return (
    <MerchantLayout
      title="报名管理"
      showBack
      onBack={handleBack}
    >
      {/* PC端使用两栏布局：左侧列表 + 右侧筛选面板 */}
      <div className="md:flex md:gap-6 md:items-start">
        {/* 左侧主内容 */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="inline-flex rounded-xl border border-gray-100 bg-white p-1 shadow-sm" aria-label="报名管理视图">
            <button
              type="button"
              onClick={() => setManagementView("list")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${managementView === "list" ? "bg-primary-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <ListChecks size={15} /> 报名名单
            </button>
            <button
              type="button"
              onClick={() => {
                setManagementView("statistics");
                setShowFilterDrawer(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${managementView === "statistics" ? "bg-primary-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <BarChart3 size={15} /> 数据统计
            </button>
          </div>

          {managementView === "statistics" ? (
            <EnrollmentStatisticsDashboard activityId={id || ""} />
          ) : (
          <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-100">
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {stats.total}
              </p>
              <p className="text-xs text-gray-500">全部</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 md:p-4 text-center">
              <p className="text-lg md:text-xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500">待审核</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 md:p-4 text-center">
              <p className="text-lg md:text-xl font-bold text-green-600">
                {stats.approved}
              </p>
              <p className="text-xs text-gray-500">已通过</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 md:p-4 text-center">
              <p className="text-lg md:text-xl font-bold text-red-500">
                {stats.rejected}
              </p>
              <p className="text-xs text-gray-500">已拒绝</p>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="搜索姓名、标签..."
                  className="w-full h-9 md:h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              {/* 筛选按钮 */}
              <button
              className="flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 md:h-10 md:px-4 [&>svg]:shrink-0"
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">筛选</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary-400 text-xs tabular-nums text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* 选择模式切换 */}
              <button
              className={`flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors md:h-10 md:px-4 [&>svg]:shrink-0 ${
                  selectionMode
                    ? "bg-primary-400 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() =>
                  selectionMode ? exitSelectionMode() : enterSelectionMode()
                }
              >
                <ListChecks size={14} />
                <span className="hidden sm:inline">
                  {selectionMode ? "退出选择" : "选择"}
                </span>
              </button>
            </div>

            {/* 功能按钮行 */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="flex h-8 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg bg-primary-50 px-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 md:h-9 md:px-4 [&>svg]:shrink-0"
                onClick={() => setShowImportModal(true)}
              >
                <Upload size={14} />
                导入
              </button>
              <button
                className="flex h-8 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg bg-gray-100 px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 md:h-9 md:px-4 [&>svg]:shrink-0"
                onClick={() => setShowExportModal(true)}
              >
                <Download size={14} />
                导出
              </button>
              <button
                className="flex h-8 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg bg-blue-50 px-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 md:h-9 md:px-4 [&>svg]:shrink-0"
                onClick={() => setShowQrModal(true)}
              >
                <QrCode size={14} />
                活动二维码
              </button>
              <button
                className="flex h-8 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg bg-secondary-50 px-3 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100 md:h-9 md:px-4 [&>svg]:shrink-0"
                onClick={handleGoMatching}
              >
                <Settings size={14} />
                匹配配置
              </button>
              <button
                className="flex h-8 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg bg-accent-50 px-3 text-sm font-medium text-accent-600 transition-colors hover:bg-accent-100 md:h-9 md:px-4 [&>svg]:shrink-0"
                onClick={handleSendNotification}
              >
                <Send size={14} />
                发送通知
              </button>
            </div>
          </div>

          {/* Tab 筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: "all", label: `全部 (${stats.total})` },
              { key: "pending", label: `待审核 (${stats.pending})` },
              { key: "approved", label: `已通过 (${stats.approved})` },
              { key: "rejected", label: `已拒绝 (${stats.rejected})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary-400 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 批量操作栏 */}
          {selectionMode && (
            <div className="bg-primary-50 rounded-xl p-3 space-y-2 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-primary-600">
                    已选 {selectedIds.length}
                  </span>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500">
                    当前 {filteredEnrollments.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-primary-500 hover:underline"
                    onClick={selectAll}
                  >
                    全选
                  </button>
                  <button
                className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap text-xs text-primary-500 hover:underline [&>svg]:shrink-0"
                    onClick={() => {
                      const invertedIds = filteredEnrollments
                        .filter((e) => !selectedIds.includes(e.id))
                        .map((e) => e.id);
                      setSelectedIds(invertedIds);
                    }}
                  >
                    <Repeat size={10} />
                    反选
                  </button>
                  <button
                className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap text-xs text-gray-500 hover:underline [&>svg]:shrink-0"
                    onClick={exitSelectionMode}
                  >
                    <X size={10} />
                    取消
                  </button>
                </div>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <button
                    className="h-8 px-3 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                    onClick={handleBatchApprove}
                  >
                    批量通过
                  </button>
                  <button
                    className="h-8 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    onClick={handleBatchReject}
                  >
                    批量结束审核
                  </button>
                  <button
                    className="h-8 px-3 rounded-lg bg-accent-400 text-white text-sm font-medium hover:bg-accent-500 transition-colors"
                    onClick={handleSendNotification}
                  >
                    发送通知
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 报名列表 - PC端可显示为双列 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              <p className="text-gray-500 mt-4">正在加载报名列表...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无报名数据</p>
              <button
                className="mt-4 px-4 py-2 bg-primary-400 text-white rounded-full text-sm font-medium hover:bg-primary-500 transition-colors"
                onClick={() => setShowImportModal(true)}
              >
                导入报名
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEnrollments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  selected={selectedIds.includes(enrollment.id)}
                  selectionMode={selectionMode}
                  onSelect={() => toggleSelect(enrollment.id)}
                  onViewDetail={() => handleViewDetail(enrollment)}
                  onLongPress={() => enterSelectionMode(enrollment.id)}
                  onPrefetchImages={
                    enrollment.imageCount
                      ? () => {
                          void prefetchEnrollmentImages(
                            queryClient,
                            sessionScope,
                            id || "",
                            enrollment.id,
                            { contentLimit: 4 },
                          ).catch(() => undefined);
                        }
                      : undefined
                  }
                />
              ))}
            </div>
            {filteredEnrollments.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span className="text-sm text-gray-500">
                  {currentPage} / {Math.ceil(filteredEnrollments.length / PAGE_SIZE)}
                </span>
                <button
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= Math.ceil(filteredEnrollments.length / PAGE_SIZE)}
                >
                  下一页
                </button>
              </div>
            )}
            </>
          )}
          </>
          )}
        </div>

        {/* PC端筛选侧边栏 (仅 md+ 屏幕且打开时) */}
        {managementView === "list" && showFilterDrawer && (
          <div className="hidden md:block w-[320px] flex-shrink-0 sticky top-4">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* 侧栏头部 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  筛选条件
                  {activeFilterCount > 0 && (
                    <span className="ml-2 text-xs font-normal text-primary-400">
                      {activeFilterCount} 项
                    </span>
                  )}
                </h3>
                <button
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  onClick={() => setShowFilterDrawer(false)}
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <PCFilterPanel
                filterOptions={filterOptions}
                filterCriteria={filterCriteria}
                onChange={(criteria) => setFilterCriteria(criteria)}
                onReset={() =>
                  setFilterCriteria({
                    ...DEFAULT_FILTER_CRITERIA,
                    keyword: filterCriteria.keyword,
                  })
                }
                activeCount={activeFilterCount}
              />
            </div>
          </div>
        )}
      </div>

      {/* 移动端筛选面板（md以下才显示） */}
      <div className={managementView === "list" ? "md:hidden" : "hidden"}>
        <FilterDrawer
          visible={showFilterDrawer}
          filterOptions={filterOptions}
          filterCriteria={filterCriteria}
          onChange={setFilterCriteria}
          onClose={() => setShowFilterDrawer(false)}
        />
      </div>

      {/* 导入报名弹窗 */}
      <ImportEnrollmentModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        activityId={id || ""}
        registrationTypes={activity?.registrationTypes}
        registrationFormSchema={activity?.registrationFormSchema}
        onSuccess={handleImportSuccess}
      />

      {/* 发送通知弹窗 */}
      <SendNotificationModal
        visible={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        activityId={id || ""}
        activityTitle={activity?.title}
        enrollments={enrollments}
        filteredEnrollments={filteredEnrollments}
        selectedIds={selectedIds}
        onSuccess={(result) => {
          console.log("[EnrollmentManagement] 通知发送完成", {
            inAppSucceeded: result.in_app_success_count,
            smsQueued: result.sms_queued_count,
            skipped: result.skipped_count,
          });
          setSelectedIds([]);
        }}
      />

      {/* 导出报名弹窗 */}
      <ExportEnrollmentModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        activityId={id || ""}
        activityTitle="活动"
        enrollments={filteredEnrollments}
      />

      <RegistrationQrModal
        visible={showQrModal}
        activityId={id || ""}
        activityTitle={activity?.title}
        registrationTypes={activity?.registrationTypes}
        onClose={() => setShowQrModal(false)}
      />

      {/* 详情抽屉 */}
      <EnrollmentDetailDrawer
        visible={showDetailDrawer}
        activityId={id || ""}
        enrollment={detailEnrollment}
        onClose={() => {
          setShowDetailDrawer(false);
          setDetailEnrollment(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
        onRequestUpdate={handleRequestEnrollmentUpdate}
        onReviewChanges={handleReviewEnrollmentChanges}
        onNotify={(enrollmentId) => {
          setShowDetailDrawer(false);
          setSelectedIds([enrollmentId]);
          setShowNotifyModal(true);
        }}
      />
    </MerchantLayout>
  );
};

export default EnrollmentManagementNew;
