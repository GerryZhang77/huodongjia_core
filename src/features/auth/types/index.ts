/**
 * Auth 模块类型定义
 *
 * 注意: 严格按照 OpenAPI 文档定义
 * 参考: docs/api_doc/modules/登录模块.openapi.json
 */

/**
 * 用户类型
 * 对应 OpenAPI schema: User.user_type
 */
export type UserType = "user" | "organizer" | "admin";

/**
 * 当前浏览器会话的可信认证状态。
 * unavailable 表示服务暂时不可用，不能把缓存 token 当成已登录。
 */
export type AuthStatus =
  | "checking"
  | "authenticated"
  | "anonymous"
  | "unavailable";

/**
 * 用户信息
 * 对应 OpenAPI schema: User
 */
export interface User {
  id: string; // UUID
  account?: string; // 学号/账号
  phone?: string | null;
  name: string;
  avatar?: string | null; // 头像 URL（后端生成或用户上传）
  user_type: UserType; // 注意：使用下划线命名，符合后端规范
  age?: number | null;
  occupation?: string | null;
  company?: string | null;
  tags: string[];
  wechat_qr?: string | null;
}

/**
 * 登录凭证
 * 对应 OpenAPI schema: LoginRequest
 */
export interface LoginCredentials {
  identifier: string; // 用户账号（用户名或手机号）
  password: string;
}

/**
 * 登录响应
 * 对应 OpenAPI schema: LoginResponse
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string; // JWT Token
  user?: User;
  isNewUser?: boolean;
  code?: string; // 错误代码（ErrorResponse）
}

/**
 * Auth 状态
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
}

/**
 * 测试账号选项
 */
export interface AccountOption {
  label: string;
  value: string;
  description: string;
}

/**
 * 发送短信验证码请求
 */
export interface SendSmsCodeRequest {
  phone: string;
  type:
    | "register"
    | "login"
    | "reset_password"
    | "enrollment"
    | "bind_phone";
}

/**
 * 发送短信验证码响应
 */
export interface SendSmsCodeResponse {
  success: boolean;
  message: string;
}

/**
 * 验证短信验证码请求
 */
export interface VerifySmsCodeRequest {
  phone: string;
  code: string;
}

/**
 * 验证短信验证码响应
 */
export interface VerifySmsCodeResponse {
  success: boolean;
  message: string;
  verified?: boolean;
}

/**
 * 注册凭证
 */
export interface RegisterCredentials {
  phone: string;
  sms_code: string;
  password: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

/**
 * 重置密码凭证
 */
export interface ResetPasswordCredentials {
  phone: string;
  sms_code: string;
  new_password: string;
}

/**
 * 重置密码响应
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
