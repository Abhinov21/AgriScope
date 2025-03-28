const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://appeears.earthdatacloud.nasa.gov',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/api': '', // ✅ Remove `/api` prefix when hitting the target
      },
    })
  );
};
