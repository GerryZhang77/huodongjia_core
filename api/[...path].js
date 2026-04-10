/**
 * Vercel Serverless Function - API 代理
 *
 * 用途：通过 Vercel Serverless Function (香港区域) 转发请求到国内后端
 * 路由：/api/* → 此函数 → http://8.160.180.91:10203/api/*
 *
 * 解决问题：
 * - Vercel Edge (东京) 直连国内 ECS 非标端口被 GFW 拦截
 * - 使用 Serverless Function 部署在 hkg1 (香港)，绕过跨境限制
 */

const BACKEND_URL = "http://8.160.180.91:10203";

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 从 req.url 提取完整 API 路径
  // Vercel 会把 /api/events?page=1 路由到此函数，req.url = /api/events?page=1
  const targetUrl = `${BACKEND_URL}${req.url}`;

  console.log(`[Proxy] ${req.method} ${req.url} -> ${targetUrl}`);

  try {
    // 准备请求头（透传关键头部）
    const headers = {};

    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }
    if (req.headers.accept) {
      headers["Accept"] = req.headers.accept;
    }

    // 准备请求体
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body) {
        body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    // 发送请求到后端
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // 透传后端响应头
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    // 返回响应
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("[Proxy Error]", error.message);
    return res.status(502).json({
      error: "Proxy Error",
      message: error.message || "Failed to connect to backend",
    });
  }
};
