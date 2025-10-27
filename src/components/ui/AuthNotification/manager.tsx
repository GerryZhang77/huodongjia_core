/**
 * Auth Notification Manager
 * 用于在非组件环境中调用通知
 */

import { createRoot } from "react-dom/client";
import { AuthNotification, type AuthNotificationProps } from "./index";

class NotificationManager {
  private container: HTMLDivElement | null = null;
  private currentNotification: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "auth-notification-container";
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private removeCurrentNotification() {
    if (this.currentNotification) {
      this.currentNotification.remove();
      this.currentNotification = null;
    }
  }

  show(props: Omit<AuthNotificationProps, "onClose">) {
    // 移除之前的通知
    this.removeCurrentNotification();

    const container = this.ensureContainer();
    const notificationDiv = document.createElement("div");
    this.currentNotification = notificationDiv;
    container.appendChild(notificationDiv);

    const root = createRoot(notificationDiv);
    root.render(
      <AuthNotification
        {...props}
        onClose={() => {
          root.unmount();
          this.removeCurrentNotification();
        }}
      />
    );
  }

  success(message: string, description?: string) {
    // 成功通知持续 2.5 秒，确保在页面跳转前用户能看到
    this.show({ type: "success", message, description, duration: 2500 });
  }

  error(message: string, description?: string) {
    // 错误通知持续 3 秒，给用户充分时间阅读
    this.show({ type: "error", message, description, duration: 3000 });
  }

  warning(message: string, description?: string) {
    // 警告通知持续 2.5 秒
    this.show({ type: "warning", message, description, duration: 2500 });
  }
}

export const authNotification = new NotificationManager();
