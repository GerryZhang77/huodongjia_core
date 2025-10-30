/**
 * 调试日志工具 - 持久化到 localStorage
 * 用于追踪页面刷新后的日志
 */

const MAX_LOGS = 100; // 最多保存 100 条日志

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: unknown;
}

class DebugLogger {
  private storageKey = "debug-logs";

  private getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  private saveLogs(logs: LogEntry[]) {
    try {
      // 只保留最新的 MAX_LOGS 条
      const trimmedLogs = logs.slice(-MAX_LOGS);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error("无法保存日志:", error);
    }
  }

  log(message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      data,
    };

    console.log(`📝 ${message}`, data || "");

    const logs = this.getLogs();
    logs.push(entry);
    this.saveLogs(logs);
  }

  warn(message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      data,
    };

    console.warn(`⚠️  ${message}`, data || "");

    const logs = this.getLogs();
    logs.push(entry);
    this.saveLogs(logs);
  }

  error(message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      data,
    };

    console.error(`❌ ${message}`, data || "");

    const logs = this.getLogs();
    logs.push(entry);
    this.saveLogs(logs);
  }

  // 查看所有日志
  viewLogs() {
    const logs = this.getLogs();
    console.table(logs);
    return logs;
  }

  // 导出日志为文本
  exportLogs(): string {
    const logs = this.getLogs();
    return logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${
            log.data ? "\n" + JSON.stringify(log.data, null, 2) : ""
          }`
      )
      .join("\n\n");
  }

  // 清空日志
  clearLogs() {
    localStorage.removeItem(this.storageKey);
    console.log("✅ 日志已清空");
  }
}

export const debugLogger = new DebugLogger();

// 在浏览器控制台暴露工具方法
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>)["debugLogger"] = {
    view: () => debugLogger.viewLogs(),
    export: () => {
      const logs = debugLogger.exportLogs();
      console.log(logs);
      return logs;
    },
    clear: () => debugLogger.clearLogs(),
  };

  console.log("💡 调试工具已就绪！使用方法:");
  console.log("  debugLogger.view()   - 查看所有日志");
  console.log("  debugLogger.export() - 导出日志文本");
  console.log("  debugLogger.clear()  - 清空日志");
}
