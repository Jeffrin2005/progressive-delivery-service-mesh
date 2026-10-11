const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const routes = require('./routes/apiRoutes');
const { httpRequestCounter } = require('./metrics/prometheus');

const app = express();

app.use(cors());
app.use(express.json());

// Disable keep-alive for immediate round-robin on Istio Canary testing
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

// Serve frontend static build if present
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Mount API routes
app.use('/', routes);

// SPA fallback to frontend index.html
app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexFile);
});

app.listen(config.PORT, () => {
  console.log(`CloudDrop Backend [${config.APP_VERSION}] listening on port ${config.PORT}`);
});
