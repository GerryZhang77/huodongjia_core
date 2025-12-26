/**
 * 事件总线 - 用于组件间通信
 * 支持 Mock 模式下的数据同步
 */

type EventHandler = (data?: any) => void;

class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map();

  /**
   * 触发事件
   */
  emit(event: string, data?: any) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler) {
    const wrappedHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      handler(customEvent.detail);
    };

    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    // 存储原始 handler 的映射关系
    const handlers = this.events.get(event)!;
    (handler as any).__wrappedHandler = wrappedHandler;
    handlers.add(handler);

    window.addEventListener(event, wrappedHandler);
  }

  /**
   * 取消监听
   */
  off(event: string, handler: EventHandler) {
    const wrappedHandler = (handler as any).__wrappedHandler;
    if (wrappedHandler) {
      window.removeEventListener(event, wrappedHandler);
    }

    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 清空所有监听器
   */
  clear() {
    this.events.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        const wrappedHandler = (handler as any).__wrappedHandler;
        if (wrappedHandler) {
          window.removeEventListener(event, wrappedHandler);
        }
      });
    });
    this.events.clear();
  }
}

// 单例导出
export const eventBus = new EventBus();

/**
 * 预定义事件常量
 */
export const EVENTS = {
  /** 用户资料更新 */
  PROFILE_UPDATED: "profile:updated",
  /** 用户头像更新 */
  AVATAR_UPDATED: "avatar:updated",
  /** 兴趣标签更新 */
  INTERESTS_UPDATED: "interests:updated",
} as const;
