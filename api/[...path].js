/**
 * Vercel API Route - API 代理
 *
 * 路径：/api/[...path]
 * 功能：代理所有 API 请求到后端
 */

const BACKEND_URL = "http://47.92.0.104:12345";

module.exports = async function handler(req, res) {
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

  // 从查询参数获取完整路径
  const { path: apiPath } = req.query;
  const targetPath = Array.isArray(apiPath)
    ? `/api/${apiPath.join("/")}`
    : `/api/${apiPath || ""}`;
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  console.log(`[API Proxy] ${req.method} ${targetPath}`);
  console.log(`[API Proxy] Target: ${targetUrl}`);
  console.log(`[API Proxy] Body:`, req.body);

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
        body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    // 发送请求到后端
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    console.log(`[API Proxy] Response:`, response.status);

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
    console.error("[API Proxy Error]", error);
    return res.status(500).json({
      error: "Proxy Error",
      message: error.message || "Unknown error",
    });
  }
}
