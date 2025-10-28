#!/bin/bash

# ============================================
# 活动家平台 - 统一 API 验证脚本
# ============================================
# 作用：测试所有核心 API 的可用性
# 使用：./scripts/test-all-apis.sh
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 统计变量
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 获取项目根目录（脚本所在目录的上级目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 加载环境变量
if [ -f "env/.env.mock" ]; then
    export $(cat env/.env.mock | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ 已加载 Mock 环境配置${NC}"
    echo -e "${BLUE}✓ 项目根目录: ${PROJECT_ROOT}${NC}\n"
else
    echo -e "${RED}✗ 未找到 env/.env.mock 文件${NC}"
    echo -e "${YELLOW}当前目录: $(pwd)${NC}"
    echo -e "${YELLOW}请确保从项目根目录或 scripts 目录运行此脚本${NC}"
    exit 1
fi

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_codes="$5"  # 可接受的状态码，用空格分隔，如 "200 201 202"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing:${NC} $name"
    echo -e "  ${method} ${url}"
    
    if [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$url")
        fi
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # 检查状态码是否在允许的范围内
    is_success=false
    for code in $expected_codes; do
        if [ "$http_code" = "$code" ]; then
            is_success=true
            break
        fi
    done
    
    if [ "$is_success" = true ]; then
        echo -e "  ${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo -e "  ${RED}Response:${NC} $(echo $body | head -c 200)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# 打印分隔线
print_separator() {
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 开始测试
echo -e "${BOLD}🧪 活动家平台 - API 可用性验证${NC}\n"
echo -e "${BLUE}测试时间:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}Mock模式:${NC} ${VITE_USE_MOCK}"
echo -e "${BLUE}Token:${NC} ${VITE_APIFOX_TOKEN}\n"

# ============================================
# 1. 认证模块测试
# ============================================
print_separator "1️⃣  认证模块 (Authentication)"

test_api \
    "获取当前用户信息" \
    "GET" \
    "${VITE_AUTH_MOCK_URL}/api/auth/me?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "商家登录" \
    "POST" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6378684/api/auth/login?apifoxToken=7WpWR1HdKZIChw9BM0LQ3" \
    '{"identifier":"merchant@test.com","password":"123456"}' \
    "200"

# ============================================
# 2. 活动管理模块测试
# ============================================
print_separator "2️⃣  活动管理 (Activity Management)"

test_api \
    "获取我的活动列表" \
    "GET" \
    "${VITE_EVENT_MOCK_URL}/api/events/my?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "获取活动详情" \
    "GET" \
    "${VITE_EVENT_MOCK_URL}/api/events/1?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "上传活动封面图片" \
    "POST" \
    "${VITE_EVENT_MOCK_URL}/api/events/upload-image?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

# 创建活动
test_api \
    "创建活动" \
    "POST" \
    "${VITE_EVENT_MOCK_URL}/create?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"title":"测试活动","description":"这是一个测试活动"}' \
    "200 201"

# ============================================
# 3. 报名管理模块测试
# ============================================
print_separator "3️⃣  报名管理 (Enrollment Management)"

test_api \
    "获取活动报名列表" \
    "GET" \
    "${VITE_EVENT_MOCK_URL}/api/events/1/enrollments?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "发送报名通知" \
    "POST" \
    "${VITE_ENROLLMENT_MOCK_URL}/api/events/1/enrollments/notify?apifoxToken=${VITE_APIFOX_TOKEN}&apifoxApiId=367358266" \
    '{"enrollmentIds":["1","2"],"notificationType":"activity_update","notificationContent":"活动更新通知"}' \
    "200"

# 批量导入
test_api \
    "批量导入报名信息" \
    "POST" \
    "${VITE_EVENT_MOCK_URL}/api/events/1/enrollments/batch-import?apifoxToken=${VITE_APIFOX_TOKEN}&apifoxApiId=367265653" \
    '{"enrollments":[{"name":"张三","gender":"male"}]}' \
    "200 201"

# ============================================
# 4. 匹配模块测试（Phase 1）
# ============================================
print_separator "4️⃣  基础匹配功能 (Basic Matching)"

test_api \
    "提取关键词" \
    "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-default/api/matching/1/extract-keywords?apifoxToken=${VITE_APIFOX_TOKEN}&apifoxApiId=368050996" \
    "" \
    "200"

test_api \
    "获取词向量" \
    "GET" \
    "${VITE_EMBEDDING_MOCK_URL}/api/match/1/get-embedding?apifoxToken=${VITE_APIFOX_TOKEN}&apifoxApiId=366709734" \
    "" \
    "200"

test_api \
    "计算相似度" \
    "GET" \
    "${VITE_EMBEDDING_MOCK_URL}/api/match/1/calculate?apifoxToken=${VITE_APIFOX_TOKEN}&apifoxApiId=366709735" \
    "" \
    "200"

# ============================================
# 5. 规则设置模块测试（Phase 2）
# ============================================
print_separator "5️⃣  规则设置 (Rule Configuration)"

test_api \
    "AI 生成匹配规则" \
    "POST" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1/generate?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"naturalLanguageInput":"希望参与者年龄相仿，职业多样化"}' \
    "200"

test_api \
    "获取规则列表" \
    "GET" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "批量保存规则配置" \
    "POST" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"rules":[{"name":"年龄相仿","weight":30,"enabled":true}]}' \
    "200"

test_api \
    "获取约束条件" \
    "GET" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1/constraints?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "保存约束条件" \
    "POST" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1/constraints?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"minGroupSize":3,"maxGroupSize":6}' \
    "200"

# ============================================
# 6. 匹配执行模块测试（Phase 3）
# ============================================
print_separator "6️⃣  匹配执行 (Matching Execution)"

test_api \
    "执行匹配算法" \
    "POST" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/1/execute?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"ruleIds":["rule-1","rule-2"]}' \
    "200 202"

test_api \
    "查询匹配任务进度" \
    "GET" \
    "${VITE_RULES_MOCK_URL}/api/match-rules/task/1?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

# ============================================
# 7. 匹配结果模块测试
# ============================================
print_separator "7️⃣  匹配结果 (Match Results)"

test_api \
    "获取匹配结果" \
    "GET" \
    "${VITE_MATCH_RESULT_MOCK_URL}/api/match-groups/1?apifoxToken=${VITE_APIFOX_TOKEN}" \
    "" \
    "200"

test_api \
    "发布匹配结果" \
    "POST" \
    "${VITE_MATCH_RESULT_MOCK_URL}/api/match-groups/1/publish?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"sendNotification":true}' \
    "200"

# ============================================
# 测试总结
# ============================================
print_separator "📊 测试总结"

echo -e "${BOLD}总计:${NC} $TOTAL_TESTS 个接口"
echo -e "${GREEN}${BOLD}通过:${NC} $PASSED_TESTS"

if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}${BOLD}失败:${NC} $FAILED_TESTS"
    echo ""
    echo -e "${YELLOW}⚠️  部分测试失败${NC}"
    echo ""
    echo -e "${BOLD}失败原因分析:${NC}"
    echo "  • 404 错误：接口在 Apifox 中可能使用了不同的路径"
    echo "  • 需要检查 Apifox 项目中的实际接口定义"
    echo "  • 部分接口可能需要特殊的 apifoxApiId 参数"
    echo ""
    echo -e "${BOLD}建议操作:${NC}"
    echo "  1. 登录 Apifox 查看各模块的实际接口路径"
    echo "  2. 检查 src/config/apifox-api-ids.ts 配置"
    echo "  3. 参考 test-matching-feature.sh 的成功案例"
    echo ""
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    echo ""
fi

# ============================================
# 附加信息
# ============================================
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  ℹ️  环境信息${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}认证模块:${NC} ${VITE_AUTH_MOCK_URL}"
echo -e "${BLUE}活动模块:${NC} ${VITE_EVENT_MOCK_URL}"
echo -e "${BLUE}报名模块:${NC} ${VITE_ENROLLMENT_MOCK_URL}"
echo -e "${BLUE}匹配模块:${NC} ${VITE_MATCHING_MOCK_URL}"
echo -e "${BLUE}词嵌入模块:${NC} ${VITE_EMBEDDING_MOCK_URL}"
echo -e "${BLUE}规则模块:${NC} ${VITE_RULES_MOCK_URL}"
echo -e "${BLUE}结果模块:${NC} ${VITE_MATCH_RESULT_MOCK_URL}"
echo ""
echo -e "${BOLD}相关文档:${NC}"
echo "  • API 文档: docs/api_doc/modules/"
echo "  • 环境配置: env/.env.mock"
echo "  • API ID 配置: src/config/apifox-api-ids.ts"
echo ""
