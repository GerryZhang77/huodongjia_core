/**
 * CitySelector 组件类型定义
 */

export interface CitySelectorProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 当前选中城市 */
  value?: string;
  /** 选择城市回调 */
  onChange?: (city: string) => void;
  /** 标题 */
  title?: string;
  /** 是否显示热门城市 */
  showHot?: boolean;
  /** 自定义类名 */
  className?: string;
}
