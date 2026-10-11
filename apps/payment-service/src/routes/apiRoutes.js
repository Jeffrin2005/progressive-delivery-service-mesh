const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const fileController = require('../controllers/fileController');
const { register } = require('../metrics/prometheus');

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.STORAGE_DIR),
  filename: (req, file, cb) => {
    const fileId = crypto.randomBytes(4).toString('hex');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${fileId}___${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 } });

// Telemetry & Probes
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

// File upload and download routes
router.post('/api/upload-file', upload.single('file'), fileController.uploadFile);
router.get('/download/raw/:fileId', fileController.downloadRaw);

// Chaos control
router.post('/chaos/set-error-rate', (req, res) => {
  const { percentage } = req.body;
  if (percentage !== undefined) {
    fileController.setErrorRate(percentage);
    return res.json({ message: `Error rate set to ${percentage}%` });
  }
  res.status(400).json({ error: 'Invalid percentage' });
});

// UI Views
router.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../views/index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html
    .replace(/\{\{VERSION_BADGE\}\}/g, config.THEME.versionBadge)
    .replace(/\{\{COLOR_NAME\}\}/g, config.THEME.colorName)
    .replace(/\{\{PRIMARY_COLOR\}\}/g, config.THEME.primary)
    .replace(/\{\{BG_GRADIENT\}\}/g, config.THEME.bgGradient)
    .replace(/\{\{TRAFFIC_SHARE\}\}/g, config.THEME.trafficShare)
    .replace(/\{\{HOSTNAME\}\}/g, process.env.HOSTNAME || 'localhost');
  res.send(html);
});

router.get('/file/:fileId', (req, res) => {
  const file = fileController.findFileById(req.params.fileId);
  if (!file) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="font-size:48px;">404</h1>
          <p>This shared file does not exist or has expired.</p>
          <a href="/" style="color:#38bdf8;">Return to Upload</a>
        </div>
      </body>
      </html>
    `);
  }

  const ext = path.extname(file.originalName).toLowerCase();
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
  const previewContent = isImage 
    ? `<div class="rounded-xl overflow-hidden border border-slate-700 bg-slate-950/60 p-2 mb-4 max-h-64 flex items-center justify-center">
         <img src="/download/raw/${file.id}" alt="Preview" class="max-h-56 max-w-full rounded-lg object-contain shadow" />
       </div>`
    : `<div class="w-24 h-24 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-4 shadow-inner">📄</div>`;

  const previewPath = path.join(__dirname, '../views/preview.html');
  let html = fs.readFileSync(previewPath, 'utf8');
  html = html
    .replace(/\{\{FILE_NAME\}\}/g, file.originalName)
    .replace(/\{\{FILE_SIZE\}\}/g, file.size)
    .replace(/\{\{FILE_ID\}\}/g, file.id)
    .replace(/\{\{PREVIEW_CONTENT\}\}/g, previewContent)
    .replace(/\{\{VERSION_BADGE\}\}/g, config.THEME.versionBadge)
    .replace(/\{\{PRIMARY_COLOR\}\}/g, config.THEME.primary)
    .replace(/\{\{BG_GRADIENT\}\}/g, config.THEME.bgGradient)
    .replace(/\{\{TRAFFIC_SHARE\}\}/g, config.THEME.trafficShare)
    .replace(/\{\{HOSTNAME\}\}/g, process.env.HOSTNAME || 'pod');
  res.send(html);
});

module.exports = router;
