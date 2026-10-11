const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const config = require('../config');
const fileController = require('../controllers/fileController');
const { register } = require('../metrics/prometheus');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.STORAGE_DIR),
  filename: (req, file, cb) => {
    const fileId = crypto.randomBytes(4).toString('hex');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${fileId}___${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 } });

// Telemetry & Health probes
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', version: config.APP_VERSION });
});

router.all('/checkout', (req, res) => {
  res.json({ status: 'SUCCESS', version: config.APP_VERSION });
});

router.get('/api/ping', (req, res) => {
  res.json({
    version: config.APP_VERSION,
    isCanary: config.IS_CANARY,
    pod: process.env.HOSTNAME || 'pod',
    time: new Date().toLocaleTimeString(),
  });
});

router.get('/api/meta', (req, res) => {
  res.json({
    version: config.APP_VERSION,
    isCanary: config.IS_CANARY,
    theme: config.THEME,
    pod: process.env.HOSTNAME || 'pod',
    errorRate: fileController.getErrorRate(),
  });
});

// File endpoints
router.post('/api/upload-file', upload.single('file'), fileController.uploadFile);
router.get('/api/file/:fileId', fileController.getFileDetails);
router.get('/download/raw/:fileId', fileController.downloadRaw);

// Chaos error rate setter
router.post('/chaos/set-error-rate', (req, res) => {
  const { percentage } = req.body;
  if (percentage !== undefined) {
    fileController.setErrorRate(percentage);
    return res.json({ message: `Error rate set to ${percentage}%` });
  }
  res.status(400).json({ error: 'Invalid percentage' });
});

module.exports = router;
