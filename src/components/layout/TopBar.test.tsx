import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/features/auth/stores";
import { TopBar } from "./TopBar";

vi.mock("@/features/user/profile/hooks/useNotifications", () => ({
  useNotifications: () => ({ data: undefined }),
}));

vi.mock("@/features/auth/hooks", () => ({
  useRequireAuthNavigation: () => ({ navigateWithAuth: vi.fn() }),
}));

const breadcrumbItems = [
  { label: "首页", path: "/u/home" },
  { label: "一个很长的活动名称", path: "/u/activities/activity-1" },
  { label: "报名" },
];

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    authStatus: "anonymous",
  });
});

describe("TopBar", () => {
  it("renders the OpenEvent logo and a single breadcrumb navigation", () => {
    render(
      <MemoryRouter>
        <TopBar
          showBreadcrumb
          breadcrumbItems={breadcrumbItems}
          showDesktopBrand
        />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole("navigation", { name: "面包屑导航" }),
    ).toHaveLength(1);

    const brandButton = screen.getByRole("button", { name: "返回首页" });
    expect(brandButton.classList.contains("lg:hidden")).toBe(false);
    const logoSource = brandButton.querySelector("img")?.getAttribute("src");
    expect(logoSource).toMatch(/^data:image\/svg\+xml/);
    expect(decodeURIComponent(logoSource || "")).toContain(
      "viewBox='0 0 117 110'",
    );
  });

  it("marks the first breadcrumb level as mobile-hidden in compact mode", () => {
    render(
      <MemoryRouter>
        <TopBar showBreadcrumb breadcrumbItems={breadcrumbItems} />
      </MemoryRouter>,
    );

    const firstBreadcrumb = screen.getByRole("button", { name: "首页" })
      .parentElement;
    expect(firstBreadcrumb?.classList.contains("hidden")).toBe(true);
    expect(firstBreadcrumb?.classList.contains("sm:flex")).toBe(true);
  });
});
