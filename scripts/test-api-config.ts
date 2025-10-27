/**
 * API 配置测试脚本
 * 用于验证 Apifox Mock 配置是否正确
 */

import {
  findApifoxApiId,
  getUnconfiguredApis,
} from "../src/config/apifox-api-ids";

console.log("🧪 测试 API 配置...\n");

// 测试路径规范化和 API ID 查找
const testCases = [
  { method: "POST", path: "/api/auth/login", expected: "366698039" },
  { method: "GET", path: "/api/events/my", expected: "366698238" },
  { method: "POST", path: "/api/events/create", expected: "366698241" },
  {
    method: "GET",
    path: "/api/events/d1375b03-e2fe-418d-b096-9064eae0d1b9",
    expected: "366698237",
  },
  {
    method: "PUT",
    path: "/api/events/d1375b03-e2fe-418d-b096-9064eae0d1b9",
    expected: "366698239",
  },
  {
    method: "DELETE",
    path: "/api/events/d1375b03-e2fe-418d-b096-9064eae0d1b9",
    expected: "366698240",
  },
  {
    method: "GET",
    path: "/api/matching/d1375b03-e2fe-418d-b096-9064eae0d1b9/extract-keywords",
    expected: "366709667",
  },
  {
    method: "POST",
    path: "/api/embedding/d1375b03-e2fe-418d-b096-9064eae0d1b9/get-embedding",
    expected: "366709734",
  },
  {
    method: "GET",
    path: "/api/embedding/d1375b03-e2fe-418d-b096-9064eae0d1b9/calculate",
    expected: "366709735",
  },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ method, path, expected }) => {
  const apiId = findApifoxApiId(method, path);
  const status = apiId === expected ? "✅" : "❌";

  if (apiId === expected) {
    passed++;
  } else {
    failed++;
    console.log(`${status} ${method} ${path}`);
    console.log(`   期望: ${expected}, 实际: ${apiId || "null"}\n`);
  }
});

console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败`);

// 检查未配置的 API
const unconfigured = getUnconfiguredApis();
if (unconfigured.length > 0) {
  console.log("\n⚠️  以下 API 未配置 API ID:");
  unconfigured.forEach((api) => {
    console.log(`   ${api.method} ${api.path} - ${api.description}`);
  });
} else {
  console.log("\n✅ 所有 API 都已配置 API ID");
}

console.log("\n🎉 配置检查完成！");
