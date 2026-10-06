import express from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/memories - Public: get all visible memories
router.get('/', (req, res) => {
  const db = getDb();
  const memories = db.memories.getAllVisible();
  res.json(memories);
});

// GET /api/memories/all - Admin: get all memories including hidden
router.get('/all', authenticateToken, (req, res) => {
  const db = getDb();
  const memories = db.memories.getAll();
  res.json(memories);
});

// POST /api/memories - Admin: create memory
router.post('/', authenticateToken, (req, res) => {
  const { title, description, photo_url, date_of_memory, display_order, is_visible } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const db = getDb();
  const memory = db.memories.create({
    title,
    description,
    photo_url,
    date_of_memory,
    display_order,
    is_visible
  });

  res.status(201).json(memory);
});

// PUT /api/memories/:id - Admin: update memory
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, photo_url, date_of_memory, display_order, is_visible } = req.body;

  const db = getDb();
  const updated = db.memories.update(id, {
    title,
    description,
    photo_url,
    date_of_memory,
    display_order,
    is_visible
  });

  if (!updated) {
    return res.status(404).json({ error: 'Memory not found' });
  }

  res.json(updated);
});

// DELETE /api/memories/:id - Admin: delete memory
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const deleted = db.memories.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Memory not found' });
  }

  res.json({ message: 'Memory deleted successfully' });
});

export default router;
