import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegistrationPhoneVerification from "./RegistrationPhoneVerification";

const mocks = vi.hoisted(() => ({
  sendSmsCode: vi.fn(),
  loginBySms: vi.fn(),
  bindPhoneBySms: vi.fn(),
  setAuth: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mocks.invalidateQueries,
  }),
}));

vi.mock("@/features/auth/services", () => ({
  sendSmsCode: mocks.sendSmsCode,
  loginBySms: mocks.loginBySms,
  bindPhoneBySms: mocks.bindPhoneBySms,
}));

vi.mock("@/features/auth/stores", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    setAuth: mocks.setAuth,
  }),
}));

vi.mock("@/components/ui/Toast", () => ({
  Toast: { show: vi.fn() },
}));

describe("RegistrationPhoneVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendSmsCode.mockResolvedValue({
      success: true,
      message: "验证码发送成功",
    });
    mocks.loginBySms.mockResolvedValue({
      success: true,
      token: "token",
      user: {
        id: "user-1",
        name: "用户0000",
        phone: "13800000000",
        user_type: "user",
      },
      isNewUser: true,
    });
    mocks.invalidateQueries.mockResolvedValue(undefined);
  });

  it("uses enrollment-purpose SMS and creates the authenticated session", async () => {
    render(<RegistrationPhoneVerification activityTitle="测试活动" />);

    fireEvent.change(screen.getByPlaceholderText("请输入 11 位手机号"), {
      target: { value: "13800000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    await waitFor(() => {
      expect(mocks.sendSmsCode).toHaveBeenCalledWith(
        "13800000000",
        "enrollment",
      );
    });

    fireEvent.change(screen.getByPlaceholderText("短信验证码"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "验证并继续" }));

    await waitFor(() => {
      expect(mocks.loginBySms).toHaveBeenCalledWith(
        "13800000000",
        "1234",
        "enrollment",
      );
      expect(mocks.setAuth).toHaveBeenCalledWith(
        expect.objectContaining({ id: "user-1", phone: "13800000000" }),
        "token",
      );
    });
  });
});
