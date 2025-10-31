#!/bin/bash

# 测试匹配规则生成接口
# 后端地址: http://47.92.0.104:12345
# 活动ID: 00000000-0000-0000-0000-000000000000

echo "======================================"
echo "测试匹配规则生成接口"
echo "======================================"
echo ""

BACKEND_URL="http://47.92.0.104:12345"
EVENT_ID="00000000-0000-0000-0000-000000000000"

echo "后端地址: $BACKEND_URL"
echo "活动ID: $EVENT_ID"
echo ""

# 测试 1: 只传 description
echo "【测试 1】只传 description 字段"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "我希望参与者能够根据兴趣爱好相似进行匹配，同时考虑年龄相近和职业背景互补"
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s
echo ""
echo ""

# 测试 2: 传 description + participantCount
echo "【测试 2】传 description + participantCount"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "我希望参与者能够根据兴趣爱好相似进行匹配",
    "participantCount": 50
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s
echo ""
echo ""

# 测试 3: 传 expectation（测试是否是这个字段）
echo "【测试 3】传 expectation 字段"
echo "--------------------------------------"
curl -X POST \
  "${BACKEND_URL}/api/match/${EVENT_ID}/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "expectation": "我希望参与者能够根据兴趣爱好相似进行匹配"
  }' \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s
echo ""
echo ""

# 测试 4: 查看接口文档（如果有）
echo "【测试 4】尝试获取 API 文档"
echo "--------------------------------------"
curl -X GET \
  "${BACKEND_URL}/api/docs" \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s | head -20
echo ""
echo ""

# 测试 5: 测试活动是否存在
echo "【测试 5】测试活动是否存在"
echo "--------------------------------------"
curl -X GET \
  "${BACKEND_URL}/api/events/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP 状态码: %{http_code}\n" \
  -s
echo ""
echo ""

echo "======================================"
echo "测试完成"
echo "======================================"
