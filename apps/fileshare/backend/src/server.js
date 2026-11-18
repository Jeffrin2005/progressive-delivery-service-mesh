
const express = require('express');
const path = require('path');
const config = require('./config');
const routes = require('./routes/apiRoutes');

const {
  httpRequestCounter,
  httpRequestDuration
} = require('./metrics/prometheus');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  res.once('finish', () => {
    if (req.path === '/metrics' || req.path === '/health') {
      return;
    }

    const route = req.route ? req.route.path : req.path;

    const labels = {
      method: req.method,
      route,
      app_version: config.APP_VERSION
    };

    httpRequestCounter.inc({
      ...labels,
      status_code: String(res.statusCode)
    });

    const seconds = Number(
      process.hrtime.bigint() - start
    ) / 1e9;

    httpRequestDuration.observe(labels, seconds);
  });

  next();
});

const frontendBuildPath = path.join(
  __dirname,
  '../../frontend/dist'
);

app.use(express.static(frontendBuildPath));
app.use('/', routes);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(
      `CloudDrop ${config.APP_VERSION} listening on ${config.PORT}`
    );
  });
}

module.exports = app;
