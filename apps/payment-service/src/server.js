const express = require('express');
const config = require('./config');
const routes = require('./routes/apiRoutes');
const { httpRequestCounter } = require('./metrics/prometheus');

const app = express();

app.use(express.json());

// Immediate round-robin middleware for Istio Canary testing
app.use((req, res, next) => {
  res.setHeader('Connection', 'close');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
      app_version: config.APP_VERSION,
    });
  });
  next();
});

// Mount modular routes
app.use('/', routes);

app.listen(config.PORT, () => {
  console.log(`CloudDrop FileShare Microservice [${config.APP_VERSION}] listening on port ${config.PORT}`);
});
