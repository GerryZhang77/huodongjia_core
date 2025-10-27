/**
 * 测试账号常量
 * MVP 版本 - 提供预设的测试账号
 */

import type { AccountOption } from "../types";

/**
 * 测试账号选项
 * 这些账号由系统预设，用于测试和演示
 */
export const TEST_ACCOUNTS: AccountOption[] = [
  {
    label: "商家账号",
    value: "org1",
    description: "密码: 123456",
  },
  {
    label: "管理员账号",
    value: "admin1",
    description: "密码: 123456",
  },
  {
    label: "普通用户",
    value: "user1",
    description: "密码: 123456",
  },
];

/**
 * 默认密码
 * 所有测试账号的默认密码
 */
export const DEFAULT_PASSWORD = "123456";
