/**
 * Shared Auth Module - 共享认证模块
 * B端商家和C端用户共用的认证逻辑
 *
 * 重新导出现有的 auth 模块，避免代码重复
 */

// 直接从现有的 auth 模块重新导出所有内容
export * from "@/features/auth";

// 类型定义也可以单独导出，方便使用
export type {
  User,
  UserType,
  AuthState,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types";
