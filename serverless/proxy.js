/**
 * Vercel Serverless Function - API 代理
 *
 * 用途：解决 HTTPS 混合内容问题
 * 文件：serverless/proxy.js
 * 路由：/serverless/proxy → 代理到后端 API
 */

const BACKEND_URL = "http://47.92.0.104:12345";

module.exports = async (req, res) => {
  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  // 获取目标路径（从查询参数）
  const path = req.url.split("?")[0].replace("/serverless/proxy", "");
  const targetPath = path.startsWith("/api") ? path : `/api${path}`;
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  console.log(`[Proxy] ${req.method} ${targetPath} -> ${targetUrl}`);

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
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    // 发送请求到后端
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // 设置 CORS 头
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // 获取响应数据
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
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
