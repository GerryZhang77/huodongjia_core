/**
 * C端用户布局组件
 * 预留，后续开发用户端时实现
 */

import { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";

interface UserLayoutProps {
  children: ReactNode;
  /** 页面标题 */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 自定义返回处理 */
  onBack?: () => void;
  /** 右侧操作区域 */
  rightContent?: ReactNode;
}

/**
 * C端用户布局
 * TODO: 后续根据用户端设计稿完善
 */
export const UserLayout: FC<UserLayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  rightContent,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      {title && (
        <NavBar
          onBack={showBack ? handleBack : undefined}
          back={showBack ? "返回" : undefined}
          right={rightContent}
          className="bg-white border-b border-gray-200"
        >
          {title}
        </NavBar>
      )}

      {/* 主内容区域 */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default UserLayout;
