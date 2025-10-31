/**
 * Vercel Serverless Function - API 代理
 *
 * 用途：解决 HTTPS 混合内容问题
 * 文件：serverless/proxy.js
 * 路由：/serverless/proxy → 代理到后端 API
 */

const BACKEND_URL = "http://47.92.0.104:12345";

module.exports = async (req, res) => {
  // 设置 CORS 头（放在最前面）
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

  // 从 URL 中提取 API 路径
  // Vercel rewrites: /api/auth/login -> /serverless/proxy?path=/api/auth/login
  const apiPath = req.url.includes("?")
    ? new URL(req.url, "http://localhost").searchParams.get("path") ||
      req.url.split("?")[0]
    : req.url;

  // 确保路径以 /api 开头
  const targetPath = apiPath.startsWith("/api") ? apiPath : `/api${apiPath}`;
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  console.log(`[Proxy] ${req.method} ${targetPath} -> ${targetUrl}`);
  console.log(`[Proxy] Request body:`, req.body);

  try {
    // 准备请求头
    const headers = {
      "Content-Type": "application/json",
    };

    // 复制 Authorization 头
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    // 准备请求体
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body) {
        // Vercel 已经解析过的 body（对象）
        body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    console.log(`[Proxy] Sending body:`, body);

    // 发送请求到后端
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    console.log(`[Proxy] Response status:`, response.status);

    // 获取响应数据
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`[Proxy] Response data:`, data);
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.log(`[Proxy] Response text:`, text);
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("[Proxy Error]", error);
    return res.status(500).json({
      error: "Proxy Error",
      message: error.message || "Unknown error",
    });
  }
};
