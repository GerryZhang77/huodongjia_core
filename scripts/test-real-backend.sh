#!/bin/bash

# ========================================
# 测试真实后端连接脚本
# ========================================
# 用于验证真实后端服务是否可访问
# ========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  真实后端连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 读取环境变量
BACKEND_URL="http://47.92.0.104:12345"

echo "后端地址: $BACKEND_URL"
echo ""

# 测试健康检查接口
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 1: 健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GET $BACKEND_URL/health"
echo ""

if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200\|404"; then
  echo "✅ 后端服务可访问"
else
  echo "❌ 后端服务不可访问"
  echo ""
  echo "请确认："
  echo "1. 后端服务是否正在运行"
  echo "2. IP 地址和端口是否正确"
  echo "3. 防火墙是否允许访问"
  exit 1
fi

echo ""

# 测试登录接口
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 2: 登录接口"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "POST $BACKEND_URL/api/auth/login"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test","password":"test"}')

echo "HTTP 状态码: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
  echo "✅ 登录接口可访问（状态码合理）"
else
  echo "⚠️  登录接口返回异常状态码: $HTTP_CODE"
fi

echo ""

# 测试 CORS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 3: CORS 配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CORS_HEADER=$(curl -s -I -X OPTIONS \
  "$BACKEND_URL/api/auth/login" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin" || echo "")

if [ -n "$CORS_HEADER" ]; then
  echo "✅ CORS 已配置"
  echo "$CORS_HEADER"
else
  echo "⚠️  未检测到 CORS 响应头"
  echo "前端可能会遇到跨域问题"
fi

echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 后端服务可访问"
echo ""
echo "下一步："
echo "1. 重启开发服务器：npm run dev:mock"
echo "2. 查看浏览器控制台日志"
echo "3. 确认请求 URL 为：$BACKEND_URL/api/auth/login"
echo ""
