import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "./utils";
import { useRequireAuthNavigation } from "../src/features/auth/hooks/useRequireAuthNavigation";
import { useAuthStore } from "../src/features/auth/stores";
import { LoginRequiredPromptProvider } from "../src/features/auth/components/LoginRequiredPromptProvider";

function NavigationProbe() {
  const location = useLocation();
  const { navigateWithAuth } = useRequireAuthNavigation();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          navigateWithAuth("/u/profile", { redirectAfterLogin: "/u/home" })
        }
      >
        打开个人中心
      </button>
      <button
        type="button"
        onClick={() =>
          navigateWithAuth("/u/activities/event-1", {
            redirectAfterLogin: "/u/home",
          })
        }
      >
        打开活动
      </button>
      <button
        type="button"
        onClick={() =>
          navigateWithAuth("/u/home", {
            redirectAfterLogin: "/u/home",
            showLoginPrompt: false,
          })
        }
      >
        立即登录
      </button>
      <span data-testid="location">
        {location.pathname}
        {location.search}
      </span>
    </>
  );
}

describe("useRequireAuthNavigation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      authStatus: "anonymous",
    });
  });

  const renderProbe = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LoginRequiredPromptProvider>
          <NavigationProbe />
        </LoginRequiredPromptProvider>
      </MemoryRouter>,
    );

  it("游客先看到简洁的登录用途提示", async () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "打开个人中心" }));

    expect(
      await screen.findByRole("dialog", { name: "登录后查看个人内容" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("登录后即可查看和管理个人信息。"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    expect(sessionStorage.getItem("eventclub:pending-login-redirect")).toBeNull();
  });

  it("活动入口展示场景文案且连续点击不会叠加弹窗", async () => {
    renderProbe();

    const activityButton = screen.getByRole("button", { name: "打开活动" });
    fireEvent.click(activityButton);
    fireEvent.click(activityButton);

    expect(
      await screen.findByRole("dialog", { name: "登录后查看活动" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "登录后即可查看活动详情并继续操作。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("dialog", { name: "登录后查看活动" }),
    ).toHaveLength(1);
  });

  it("保持游客模式会关闭提示并留在原页面", async () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "打开个人中心" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "保持游客模式" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "登录后查看个人内容" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    expect(sessionStorage.getItem("eventclub:pending-login-redirect")).toBeNull();
  });

  it("确认去登录后才保存登录后落点并导航", async () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "打开个人中心" }));
    fireEvent.click(await screen.findByRole("button", { name: "去登录" }));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/login?redirect=%2Fu%2Fhome",
      ),
    );
    expect(sessionStorage.getItem("eventclub:pending-login-redirect")).toBe(
      "/u/home",
    );
  });

  it("明确的登录按钮不重复弹出提示", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "立即登录" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/login?redirect=%2Fu%2Fhome",
    );
  });

  it("登录用户直接进入目标页面", () => {
    useAuthStore.setState({
      user: { id: "user-1", name: "测试用户", user_type: "user" },
      token: "token",
      isAuthenticated: true,
      authStatus: "authenticated",
    });

    render(
      <MemoryRouter initialEntries={["/u/home"]}>
        <LoginRequiredPromptProvider>
          <NavigationProbe />
        </LoginRequiredPromptProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开个人中心" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/u/profile");
  });
});
