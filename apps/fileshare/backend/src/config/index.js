const path = require('path');

const APP_VERSION = process.env.APP_VERSION || 'v1.0.0';
const IS_CANARY = APP_VERSION.includes('v2') || APP_VERSION.includes('canary');

const THEME = IS_CANARY ? {
  versionBadge: 'v2.0.0 (CANARY)',
  colorName: 'Royal Purple',
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  border: '#6d28d9',
  trafficShare: 'v2 RELEASE'
} : {
  versionBadge: 'v1.0.0 (STABLE)',
  colorName: 'Ocean Blue',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  border: '#2563eb',
  trafficShare: 'v1 RELEASE'
};

module.exports = {
  PORT: process.env.PORT || 8080,
  APP_VERSION,
  IS_CANARY,
  THEME,
  STORAGE_DIR: process.env.STORAGE_PATH || '/tmp/shared-files',
  INITIAL_ERROR_PERCENTAGE: parseInt(process.env.INITIAL_ERROR_PERCENTAGE || '0', 10)
};
