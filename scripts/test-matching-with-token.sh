#!/bin/bash

# 测试匹配规则生成接口（带 Token）
# 使用说明：
# 1. 先在浏览器中登录，获取 localStorage 中的 token
# 2. 运行此脚本：./test-matching-with-token.sh "your-token-here"

echo "======================================"
echo "测试匹配规则生成接口（带 Token）"
echo "======================================"
echo ""

BACKEND_URL="http://47.92.0.104:12345"
EVENT_ID="00000000-0000-0000-0000-000000000000"

# 从参数获取 token
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "❌ 错误：未提供 Token"
    echo ""
    echo "使用方法："
    echo "  1. 在浏览器中打开开发者工具（F12）"
    echo "  2. 在 Console 中执行："
    echo "     JSON.parse(localStorage.getItem('auth-storage')).state.token"
    echo "  3. 复制输出的 token"
    echo "  4. 运行此脚本："
    echo "     ./test-matching-with-token.sh \"your-token-here\""
    echo ""
    exit 1
fi

echo "后端地址: $BACKEND_URL"
echo "活动ID: $EVENT_ID"
echo "Token: ${TOKEN:0:20}..." # 只显示前20个字符
echo ""

# 测试 1: 只传 description
echo "【测试 1】只传 description 字段"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "description": "我希望参与者能够根据兴趣爱好相似进行匹配，同时考虑年龄相近和职业背景互补"
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# 测试 2: 传 description + participantCount
echo "【测试 2】传 description + participantCount"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "description": "我希望参与者能够根据兴趣爱好相似进行匹配",
    "participantCount": 50
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# 测试 3: 传 expectation（测试是否是这个字段）
echo "【测试 3】传 expectation 字段"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "expectation": "我希望参与者能够根据兴趣爱好相似进行匹配"
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# 测试 4: 传空对象
echo "【测试 4】传空对象"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{}' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# 测试 5: 测试活动是否存在
echo "【测试 5】测试活动是否存在"
echo "--------------------------------------"
curl -X GET \
  "${BACKEND_URL}/api/events/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

echo "======================================"
echo "测试完成"
echo "======================================"
echo ""
echo "💡 提示："
echo "  - 如果返回 401，说明 token 无效或已过期，请重新登录"
echo "  - 如果返回 400，请查看错误信息，确认正确的请求体结构"
echo "  - 如果返回 200，说明请求成功！"
