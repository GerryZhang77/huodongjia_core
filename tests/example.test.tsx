import { describe, it, expect } from "vitest";
import { render, screen } from "./utils";

// ========================================
// 示例测试 - 验证 MSW 配置
// ========================================

describe("MSW 配置验证", () => {
  it("测试环境运行正常", () => {
    expect(true).toBe(true);
  });

  it("可以渲染 React 组件", () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText("Hello Test")).toBeInTheDocument();
  });
});
