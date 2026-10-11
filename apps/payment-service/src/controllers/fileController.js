const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure storage directory exists
if (!fs.existsSync(config.STORAGE_DIR)) {
  fs.mkdirSync(config.STORAGE_DIR, { recursive: true });
}

let errorRate = config.INITIAL_ERROR_PERCENTAGE;

function getErrorRate() {
  return errorRate;
}

function setErrorRate(newRate) {
  errorRate = newRate;
}

function findFileById(fileId) {
  try {
    const files = fs.readdirSync(config.STORAGE_DIR);
    const target = files.find(f => f.startsWith(`${fileId}___`));
    if (!target) return null;
    const parts = target.split('___');
    const filePath = path.join(config.STORAGE_DIR, target);
    const stat = fs.statSync(filePath);
    return {
      id: fileId,
      filenameOnDisk: target,
      originalName: parts.slice(1).join('___'),
      filePath,
      size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB'
    };
  } catch (err) {
    return null;
  }
}

// Controller handlers
exports.uploadFile = (req, res) => {
  const roll = Math.random() * 100;
  if (roll < errorRate) {
    return res.status(500).json({
      status: 'FAILED',
      error: 'STORAGE_UPLOAD_TIMEOUT',
      message: 'Simulated cloud storage S3 timeout',
      version: config.APP_VERSION,
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }

  const [fileId] = req.file.filename.split('___');
  const sizeFormatted = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

  return res.status(200).json({
    status: 'SUCCESS',
    file: {
      id: fileId,
      name: req.file.originalname,
      size: sizeFormatted,
      previewUrl: `/file/${fileId}`,
      pod: process.env.HOSTNAME || 'pod',
      version: config.APP_VERSION
    }
  });
};

exports.downloadRaw = (req, res) => {
  const file = findFileById(req.params.fileId);
  if (!file) return res.status(404).send('File not found or expired.');
  res.download(file.filePath, file.originalName);
};

exports.getFileDetails = (req, res) => {
  const file = findFileById(req.params.fileId);
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ file, version: config.APP_VERSION });
};

exports.findFileById = findFileById;
exports.getErrorRate = getErrorRate;
exports.setErrorRate = setErrorRate;
