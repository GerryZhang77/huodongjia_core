import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("@/features/auth/hooks", () => ({
  useLogin: () => ({
    login: vi.fn(),
    loginBySms: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/features/auth/services", () => ({
  sendSmsCode: vi.fn(),
}));

describe("LoginForm default mode", () => {
  it("opens with verification-code login by default", () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("tab", { name: "验证码登录" }).getAttribute(
        "aria-selected",
      ),
    ).toBe("true");
    expect(
      screen.getByRole("tab", { name: "密码登录" }).getAttribute(
        "aria-selected",
      ),
    ).toBe("false");
  });

  it("allows organizer links to explicitly request password mode", () => {
    render(
      <MemoryRouter initialEntries={["/login?mode=password"]}>
        <LoginForm />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("tab", { name: "密码登录" }).getAttribute(
        "aria-selected",
      ),
    ).toBe("true");
  });
});
