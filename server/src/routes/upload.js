const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const BLOCKED_TYPES = ['image/heic', 'image/heif', 'image/avif'];
const BLOCKED_EXTS = ['.heic', '.heif', '.avif'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_TYPES.includes(file.mimetype) || BLOCKED_EXTS.includes(ext)) {
      return cb(new Error('HEIC/iPhone photos cannot be displayed in browsers. Please export as JPG or PNG first.'));
    }
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

module.exports = router;
