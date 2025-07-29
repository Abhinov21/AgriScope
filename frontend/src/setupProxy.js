const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for NASA API
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

  // Proxy for backend authentication and API routes
  app.use(
    ['/auth', '/api/fields', '/api/weather'],
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    })
  );
};
