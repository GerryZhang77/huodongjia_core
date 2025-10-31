/**
 * Vercel Serverless Function - API 代理
 * 
 * 用途：解决 HTTPS 混合内容问题
 * 原理：前端 HTTPS 请求 → Vercel Function (HTTPS) → 后端 HTTP API
 * 
 * 文件：api-proxy/[...path].ts
 * 路由：/api-proxy/* → 代理到 http://47.92.0.104:12345/api/*
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://47.92.0.104:12345';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // 获取原始路径
  const { path } = req.query;
  const pathArray = Array.isArray(path) ? path : [path];
  const targetPath = '/api/' + pathArray.join('/');
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  console.log(`[Proxy] ${req.method} ${targetPath} -> ${targetUrl}`);

  try {
    // 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 复制 Authorization 头
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // 准备请求配置
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // 添加请求体（非 GET/HEAD 请求）
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
    }

    // 发送请求到后端
    const response = await fetch(targetUrl, fetchOptions);

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 获取响应数据
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }

  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
