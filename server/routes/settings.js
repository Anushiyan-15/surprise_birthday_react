import express from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/settings - Public: get all settings as key-value map
router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.settings.getAll();
  res.json(settings);
});

// PUT /api/settings - Admin: update settings (batch)
router.put('/', authenticateToken, (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object required' });
  }

  const db = getDb();
  const updatedSettings = db.settings.setMany(settings);
  res.json(updatedSettings);
});

// PUT /api/settings/:key - Admin: update single setting
router.put('/:key', authenticateToken, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const db = getDb();
  const updated = db.settings.set(key, value);
  res.json(updated);
});

export default router;
