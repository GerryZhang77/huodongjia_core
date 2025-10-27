#!/bin/bash

# API 配置验证脚本
# 测试所有 Apifox Mock 接口是否正常工作

echo "🧪 开始测试 Apifox Cloud Mock 接口..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# Apifox Token
APIFOX_TOKEN="7WpWR1HdKZIChw9BM0LQ3"

# 测试函数
test_api() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    TOTAL=$((TOTAL + 1))
    echo "Testing: $description"
    echo "  $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
            -H "Content-Type: application/json" \
            -H "apifoxToken: $APIFOX_TOKEN")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "apifoxToken: $APIFOX_TOKEN" \
            -d "$data")
    fi
    
    # 获取状态码（最后一行）
    http_code=$(echo "$response" | tail -n1)
    # 获取响应体（除了最后一行）
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  认证模块测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_api "POST" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6378684/api/auth/login" \
    '{"identifier": "test@example.com", "password": "123456"}' \
    "商家登录"

test_api "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6378684/api/auth/me" \
    "" \
    "获取当前用户信息"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  活动模块测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_api "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6383074/api/events/my" \
    "" \
    "获取我的活动列表"

test_api "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6383074/api/events/d1375b03-e2fe-418d-b096-9064eae0d1b9" \
    "" \
    "获取活动详情"

test_api "POST" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6383074/api/events/create" \
    '{"title": "测试活动", "description": "这是一个测试活动"}' \
    "创建活动"

test_api "POST" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6383074/api/events/upload-image" \
    '{}' \
    "上传活动封面图片"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  匹配模块测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_api "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6402615/api/matching/d1375b03-e2fe-418d-b096-9064eae0d1b9/extract-keywords" \
    "" \
    "提取关键词"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  词嵌入模块测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_api "POST" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6408049/api/embedding/d1375b03-e2fe-418d-b096-9064eae0d1b9/get-embedding" \
    '{"word": "开朗"}' \
    "获取词向量"

test_api "GET" \
    "https://m1.apifoxmock.com/m1/7269221-6996856-6408049/api/embedding/d1375b03-e2fe-418d-b096-9064eae0d1b9/calculate" \
    "" \
    "计算相似度"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "总计: $TOTAL 个接口"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！Apifox Mock 配置正确。${NC}"
    exit 0
else
    echo -e "${RED}⚠️  部分测试失败，请检查配置。${NC}"
    exit 1
fi
