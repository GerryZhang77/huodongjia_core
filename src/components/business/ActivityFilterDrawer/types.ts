/**
 * ActivityFilterDrawer 组件类型定义
 */

export interface ActivityFilters {
  /** 活动类型 */
  categories: string[];
  /** 时间范围 */
  timeRange: "all" | "today" | "tomorrow" | "weekend" | "week" | "month";
  /** 价格范围 */
  priceRange: "all" | "free" | "paid";
  /** 标签 */
  tags: string[];
}

export interface ActivityFilterDrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 当前筛选条件 */
  filters: ActivityFilters;
  /** 筛选条件变化回调 */
  onFiltersChange: (filters: ActivityFilters) => void;
  /** 重置筛选 */
  onReset?: () => void;
  /** 确认筛选 */
  onConfirm?: () => void;
}

// 默认筛选条件
export const defaultFilters: ActivityFilters = {
  categories: [],
  timeRange: "all",
  priceRange: "all",
  tags: [],
};

// 活动类型选项
export const categoryOptions = [
  { label: "户外运动", value: "户外运动" },
  { label: "社交聚会", value: "社交聚会" },
  { label: "技术交流", value: "技术交流" },
  { label: "文化学习", value: "文化学习" },
  { label: "艺术展览", value: "艺术展览" },
  { label: "亲子活动", value: "亲子活动" },
  { label: "体育运动", value: "体育运动" },
  { label: "音乐演出", value: "音乐演出" },
];

// 时间范围选项
export const timeRangeOptions = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "明天", value: "tomorrow" },
  { label: "本周末", value: "weekend" },
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
];

// 价格范围选项
export const priceRangeOptions = [
  { label: "全部", value: "all" },
  { label: "免费", value: "free" },
  { label: "付费", value: "paid" },
];

// 热门标签
export const tagOptions = [
  "户外",
  "社交",
  "运动",
  "读书",
  "技术",
  "艺术",
  "音乐",
  "摄影",
  "美食",
  "旅行",
  "创业",
  "投资",
  "设计",
  "电影",
  "游戏",
];
