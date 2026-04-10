// 最简测试函数 - 诊断 Serverless Function 是否能正常运行
module.exports = async (req, res) => {
  res.status(200).json({
    ok: true,
    url: req.url,
    method: req.method,
    node: process.version,
    time: new Date().toISOString(),
  });
};
