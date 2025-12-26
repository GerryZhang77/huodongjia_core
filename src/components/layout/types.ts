/**
 * 布局组件的类型定义
 */

export interface BreadcrumbItem {
  /** 显示文本 */
  label: string;
  /** 路由路径（没有则不可点击） */
  path?: string;
  /** 图标（可选） */
  icon?: React.ElementType;
}

export interface TopBarProps {
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 是否显示通知按钮 */
  showNotification?: boolean;
  /** Logo 点击回调 */
  onLogoClick?: () => void;
  /** 自定义右侧内容 */
  rightContent?: React.ReactNode;
}
