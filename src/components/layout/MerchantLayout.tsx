/**
 * B端商家布局组件
 * 包含导航栏、底部栏等通用布局元素
 */

import { FC, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavBar, TabBar } from "antd-mobile";
import { AppOutline, UserOutline, AddCircleOutline } from "antd-mobile-icons";

interface MerchantLayoutProps {
  children: ReactNode;
  /** 页面标题 */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 是否显示底部导航栏 */
  showTabBar?: boolean;
  /** 自定义返回处理 */
  onBack?: () => void;
  /** 右侧操作区域 */
  rightContent?: ReactNode;
}

/**
 * 底部导航栏配置
 */
const tabs = [
  {
    key: "/dashboard",
    title: "活动",
    icon: <AppOutline />,
  },
  {
    key: "/dashboard/activity/create",
    title: "创建",
    icon: <AddCircleOutline />,
  },
  {
    key: "/dashboard/profile",
    title: "我的",
    icon: <UserOutline />,
  },
];

/**
 * B端商家布局
 * - 顶部导航栏（可选返回按钮）
 * - 底部 TabBar（仅在主要页面显示）
 */
export const MerchantLayout: FC<MerchantLayoutProps> = ({
  children,
  title,
  showBack = false,
  showTabBar = false,
  onBack,
  rightContent,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  // 计算当前激活的 tab
  const activeKey =
    tabs.find((tab) => location.pathname.startsWith(tab.key))?.key ||
    "/dashboard";

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
      <main className={`flex-1 ${showTabBar ? "pb-14" : ""}`}>{children}</main>

      {/* 底部导航栏 */}
      {showTabBar && (
        <TabBar
          activeKey={activeKey}
          onChange={handleTabChange}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        >
          {tabs.map((tab) => (
            <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
          ))}
        </TabBar>
      )}
    </div>
  );
};

export default MerchantLayout;
