/**
 * 测试路由配置
 */

// 模拟路由配置
const MODULE_ROUTES = [
  {
    prefix: "/api/matching",
    pattern: /^\/api\/matching/,
    name: "匹配模块",
  },
  {
    prefix: "/api/match-rules",
    pattern: /^\/api\/match-rules/,
    name: "规则设置模块",
  },
  {
    prefix: "/api/match",
    pattern: /^\/api\/match(?!-rules)/,
    name: "词嵌入模块",
  },
];

function testRoute(path: string): string {
  const route = MODULE_ROUTES.find((r) => r.pattern.test(path));
  return route ? route.name : "未匹配";
}

// 测试用例
const testCases = [
  { path: "/api/matching/1/extract-keywords", expected: "匹配模块" },
  { path: "/api/match/1/get-embedding", expected: "词嵌入模块" },
  { path: "/api/match/1/calculate", expected: "词嵌入模块" },
  { path: "/api/match-rules/1/generate", expected: "规则设置模块" },
  { path: "/api/match-rules/1", expected: "规则设置模块" },
  { path: "/api/match-rules/1/constraints", expected: "规则设置模块" },
];

console.log("🧪 测试路由匹配...\n");

let passed = 0;
let failed = 0;

testCases.forEach(({ path, expected }) => {
  const result = testRoute(path);
  const isPass = result === expected;

  if (isPass) {
    console.log(`✅ ${path}`);
    console.log(`   → ${result}\n`);
    passed++;
  } else {
    console.log(`❌ ${path}`);
    console.log(`   期望: ${expected}`);
    console.log(`   实际: ${result}\n`);
    failed++;
  }
});

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败`);

if (failed > 0) {
  process.exit(1);
}
