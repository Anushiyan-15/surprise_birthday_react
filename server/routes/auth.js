import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/init.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'birthday_secret_key_2024_super_secure';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = getDb();
  const admin = db.admins.findByUsernameOrEmail(username);

  if (!admin) {
    return res.status(401).json({ error: 'Invalid username' });
  }

  const isValid = bcrypt.compareSync(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid passwordcd ' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    admin: { id: admin.id, username: admin.username, email: admin.email }
  });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both passwords required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const db = getDb();
  const admin = db.admins.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  const isValid = bcrypt.compareSync(currentPassword, admin.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.admins.updatePassword(req.admin.id, hashedPassword);

  res.json({ message: 'Password changed successfully' });
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ admin: req.admin, valid: true });
});

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export default router;
