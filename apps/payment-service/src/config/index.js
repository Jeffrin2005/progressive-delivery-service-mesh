const path = require('path');

const APP_VERSION = process.env.APP_VERSION || 'v1.0.0';
const IS_CANARY = APP_VERSION.includes('v2') || APP_VERSION.includes('canary');

const THEME = IS_CANARY ? {
  versionBadge: 'v2.0.0 (CANARY)',
  colorName: 'Emerald Green',
  primary: '#10b981',
  primaryHover: '#059669',
  border: '#059669',
  bgGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)',
  trafficShare: '20% CANARY'
} : {
  versionBadge: 'v1.0.0 (STABLE)',
  colorName: 'Ocean Blue',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  border: '#2563eb',
  bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 50%, #020617 100%)',
  trafficShare: '80% STABLE'
};

module.exports = {
  PORT: process.env.PORT || 8080,
  APP_VERSION,
  IS_CANARY,
  THEME,
  STORAGE_DIR: process.env.STORAGE_PATH || path.join(__dirname, '../../storage-shared'),
  INITIAL_ERROR_PERCENTAGE: parseInt(process.env.INITIAL_ERROR_PERCENTAGE || '0', 10)
};
