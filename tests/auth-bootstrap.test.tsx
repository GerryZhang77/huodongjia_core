import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { render, screen, waitFor } from "./utils";
import { server } from "../src/mocks/server";
import { AuthBootstrap } from "../src/features/auth/components/AuthBootstrap";
import { useAuthStore } from "../src/features/auth/stores";
import { queryClient } from "../src/config/queryClient";

const verifiedUser = {
  id: "verified-user",
  name: "服务端用户",
  user_type: "user" as const,
  tags: [],
};

describe("AuthBootstrap", () => {
  beforeEach(() => {
    localStorage.clear();
    queryClient.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      authStatus: "anonymous",
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("没有 token 时直接进入游客状态且不请求 /auth/me", async () => {
    let authMeRequests = 0;
    server.use(
      http.get("/api/auth/me", () => {
        authMeRequests += 1;
        return HttpResponse.json({ success: true, user: verifiedUser });
      }),
    );
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      authStatus: "checking",
    });

    render(
      <AuthBootstrap>
        <div>游客首页</div>
      </AuthBootstrap>,
    );

    await screen.findByText("游客首页");
    expect(authMeRequests).toBe(0);
    expect(useAuthStore.getState().authStatus).toBe("anonymous");
  });

  it("只用服务端响应恢复用户身份", async () => {
    server.use(
      http.get("/api/auth/me", ({ request }) => {
        expect(request.headers.get("Authorization")).toBe("Bearer valid-token");
        return HttpResponse.json({ success: true, user: verifiedUser });
      }),
    );
    useAuthStore.setState({
      user: null,
      token: "valid-token",
      isAuthenticated: false,
      authStatus: "checking",
    });

    render(
      <AuthBootstrap>
        <div>业务页面</div>
      </AuthBootstrap>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("正在校验登录状态");
    await screen.findByText("业务页面");
    expect(useAuthStore.getState()).toMatchObject({
      user: verifiedUser,
      token: "valid-token",
      isAuthenticated: true,
      authStatus: "authenticated",
    });
  });

  it("401 清除认证状态和私有查询缓存", async () => {
    server.use(
      http.get("/api/auth/me", () =>
        HttpResponse.json(
          { success: false, message: "登录已过期" },
          { status: 401 },
        ),
      ),
    );
    queryClient.setQueryData(["private-profile"], { name: "缓存用户" });
    useAuthStore.setState({
      user: null,
      token: "expired-token",
      isAuthenticated: false,
      authStatus: "checking",
    });

    render(
      <AuthBootstrap>
        <div>游客内容</div>
      </AuthBootstrap>,
    );

    await screen.findByText("游客内容");
    await waitFor(() => {
      expect(useAuthStore.getState()).toMatchObject({
        user: null,
        token: null,
        isAuthenticated: false,
        authStatus: "anonymous",
      });
    });
    expect(queryClient.getQueryData(["private-profile"])).toBeUndefined();
  });

  it("503 保留 token 供重试，但不会恢复缓存个人信息", async () => {
    server.use(
      http.get("/api/auth/me", () =>
        HttpResponse.json(
          { success: false, message: "服务暂时不可用" },
          { status: 503 },
        ),
      ),
    );
    useAuthStore.setState({
      user: null,
      token: "retry-token",
      isAuthenticated: false,
      authStatus: "checking",
    });

    render(
      <AuthBootstrap>
        <div>公开内容</div>
      </AuthBootstrap>,
    );

    await screen.findByText("公开内容");
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: "retry-token",
      isAuthenticated: false,
      authStatus: "unavailable",
    });
  });
});

describe("auth-storage migration", () => {
  it("旧版本缓存只迁移 token，不迁移用户资料和认证结论", async () => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        version: 1,
        state: {
          token: "legacy-token",
          user: { id: "stale-user", name: "缓存账号", user_type: "organizer" },
          isAuthenticated: true,
        },
      }),
    );

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: "legacy-token",
      isAuthenticated: false,
      authStatus: "checking",
    });
  });
});
