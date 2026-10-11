const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests processed by FileShare API',
  labelNames: ['method', 'route', 'status_code', 'app_version'],
  registers: [register],
});

module.exports = {
  register,
  httpRequestCounter,
};
