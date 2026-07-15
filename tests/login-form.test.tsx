import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "./utils";
import { MemoryRouter } from "react-router-dom";
import { render } from "./utils";

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  loginBySms: vi.fn(),
  sendSmsCode: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("../src/features/auth/hooks", () => ({
  useLogin: () => ({
    login: authMocks.login,
    loginBySms: authMocks.loginBySms,
    loading: false,
  }),
}));

vi.mock("../src/features/auth/services", () => ({
  sendSmsCode: authMocks.sendSmsCode,
}));

vi.mock("../src/components/ui/Toast", () => ({
  Toast: { show: authMocks.toast },
}));

vi.mock("../src/components/ui", () => ({
  Modal: () => null,
}));

vi.mock("../src/components/legal", () => ({
  UserAgreement: () => null,
  PrivacyPolicy: () => null,
}));

import { LoginForm } from "../src/pages/common/Login/components/LoginForm";

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe("OpenEvent LoginForm", () => {
  beforeEach(() => {
    localStorage.clear();
    authMocks.login.mockReset().mockResolvedValue(true);
    authMocks.loginBySms.mockReset().mockResolvedValue(true);
    authMocks.sendSmsCode.mockReset().mockResolvedValue({ success: true });
    authMocks.toast.mockReset();
  });

  it("密码为空时禁用按钮，填写后可提交并记住账号", async () => {
    renderLoginForm();

    const submit = screen.getByRole("button", { name: "登录", exact: true });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("账号"), {
      target: { value: "momo" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "记住账号" }));

    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(authMocks.login).toHaveBeenCalledWith({
        identifier: "momo",
        password: "123456",
      }),
    );
    expect(localStorage.getItem("openevent:remembered-login-account")).toBe(
      "momo",
    );
  });

  it("手机号流程使用单一主按钮并保持四位验证码", async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole("tab", { name: "手机登录" }));

    const phone = screen.getByLabelText("手机号");
    const code = screen.getByLabelText("验证码");
    const getCode = screen.getByRole("button", { name: "获取验证码" });
    expect(getCode).toBeDisabled();

    fireEvent.change(phone, { target: { value: "13800138000" } });
    expect(getCode).toBeEnabled();
    fireEvent.click(getCode);

    await waitFor(() =>
      expect(authMocks.sendSmsCode).toHaveBeenCalledWith(
        "13800138000",
        "login",
      ),
    );
    expect(
      screen.getByRole("button", { name: /重新获取（\d+）/ }),
    ).toBeDisabled();

    fireEvent.change(code, { target: { value: "123456" } });
    expect(code).toHaveValue("1234");

    const submit = screen.getByRole("button", { name: "登录", exact: true });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(authMocks.loginBySms).toHaveBeenCalledWith("13800138000", "1234"),
    );
  });
});
