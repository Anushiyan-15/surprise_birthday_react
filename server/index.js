import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import memoriesRoutes from './routes/memories.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import { initDb } from './db/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDb();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Birthday Surprise API is running! 🎂' });
});

app.listen(PORT, () => {
  console.log(`🎂 Birthday Surprise Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads served from /uploads`);
});
