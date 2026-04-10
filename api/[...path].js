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

const http = require("http");

const BACKEND_HOST = "8.160.180.91";
const BACKEND_PORT = 10203;

module.exports = async (req, res) => {
  try {
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

    const path = req.url || "/";

    // 准备请求头（透传关键头部）
    const proxyHeaders = {};
    if (req.headers["content-type"]) {
      proxyHeaders["content-type"] = req.headers["content-type"];
    }
    if (req.headers.authorization) {
      proxyHeaders["authorization"] = req.headers.authorization;
    }
    if (req.headers.accept) {
      proxyHeaders["accept"] = req.headers.accept;
    }

    // 准备请求体
    var bodyData = null;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      bodyData = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      if (!proxyHeaders["content-type"]) {
        proxyHeaders["content-type"] = "application/json";
      }
      proxyHeaders["content-length"] = Buffer.byteLength(bodyData);
    }

    return new Promise(function (resolve) {
      var proxyReq = http.request(
        {
          hostname: BACKEND_HOST,
          port: BACKEND_PORT,
          path: path,
          method: req.method,
          headers: proxyHeaders,
          timeout: 25000,
        },
        function (proxyRes) {
          var chunks = [];
          proxyRes.on("data", function (chunk) { chunks.push(chunk); });
          proxyRes.on("end", function () {
            var responseBody = Buffer.concat(chunks).toString("utf-8");
            var contentType = proxyRes.headers["content-type"] || "";

            if (contentType) {
              res.setHeader("Content-Type", contentType);
            }

            res.status(proxyRes.statusCode || 502);

            if (contentType.includes("application/json")) {
              try {
                res.json(JSON.parse(responseBody));
              } catch (e) {
                res.send(responseBody);
              }
            } else {
              res.send(responseBody);
            }
            resolve();
          });
        }
      );

      proxyReq.on("error", function (err) {
        res.status(502).json({
          error: "Proxy Error",
          message: err.message || "Failed to connect to backend",
        });
        resolve();
      });

      proxyReq.on("timeout", function () {
        proxyReq.destroy();
        res.status(504).json({
          error: "Gateway Timeout",
          message: "Backend connection timed out",
        });
        resolve();
      });

      if (bodyData) {
        proxyReq.write(bodyData);
      }
      proxyReq.end();
    });
  } catch (e) {
    return res.status(500).json({
      error: "Function Error",
      message: e.message,
      stack: e.stack,
    });
  }
};
