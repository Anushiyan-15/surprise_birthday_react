import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache + persistent JSON store
let data = {
  admins: [],
  memories: [],
  site_settings: {}
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

export function initDb() {
  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Load existing data if file exists
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch (err) {
      console.warn('Could not read existing db.json, creating new one');
    }
  }

  // Ensure default structures
  if (!data.admins) data.admins = [];
  if (!data.memories) data.memories = [];
  if (!data.site_settings) data.site_settings = {};

  // Seed default admin if none exists
  const adminExists = data.admins.find(a => a.username === 'admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('birthday2024', 10);
    data.admins.push({
      id: 1,
      username: 'admin',
      email: 'admin@birthday.com',
      password: hashedPassword,
      created_at: new Date().toISOString()
    });
    console.log('✅ Default admin created: username=admin, password=birthday2024');
  }

  // Seed default settings
  const defaultSettings = {
    birthday_person_name: 'My Love',
    from_name: 'Your Partner',
    birthday_letter: 'Happy Birthday, my love! Every day with you is a gift, but today is extra special.\n\nYou fill my life with joy, laughter, and endless happiness. I am so grateful to have you by my side.\n\nHere is to another year of beautiful memories together. I love you more than words can say.',
    landing_subtitle: 'A special surprise just for you ✨',
    primary_color: '#ff6b9d',
    secondary_color: '#c44569',
    accent_color: '#f8a5c2',
    background_theme: 'dark-purple',
    font_family: 'Playfair Display',
    site_title: 'Happy Birthday! 🎂',
    candle_count: '24',
    show_fireworks: 'true',
    music_enabled: 'false'
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (data.site_settings[key] === undefined) {
      data.site_settings[key] = value;
    }
  }

  // Seed sample memories if empty
  if (data.memories.length === 0) {
    data.memories = [
      {
        id: 1,
        title: 'Our First Date',
        description: 'The day everything changed — when I first looked into your eyes and knew you were the one.',
        photo_url: null,
        date_of_memory: '2023-01-15',
        display_order: 1,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Our First Trip Together',
        description: 'Adventures are always sweeter and more unforgettable when shared with you.',
        photo_url: null,
        date_of_memory: '2023-06-20',
        display_order: 2,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'The Day You Made Me Laugh So Hard',
        description: 'You have this magical gift of making my heart lighter and every ordinary moment feel special.',
        photo_url: null,
        date_of_memory: '2023-09-10',
        display_order: 3,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  saveDb();
  console.log('✅ Database initialized successfully (JSON file store)');
}

// Database helper object providing an easy-to-use API matching SQLite semantics
export function getDb() {
  return {
    admins: {
      findByUsernameOrEmail: (identifier) => {
        return data.admins.find(a => a.username === identifier || a.email === identifier);
      },
      findById: (id) => {
        return data.admins.find(a => a.id === Number(id));
      },
      updatePassword: (id, hashedPassword) => {
        const admin = data.admins.find(a => a.id === Number(id));
        if (admin) {
          admin.password = hashedPassword;
          saveDb();
          return true;
        }
        return false;
      }
    },
    memories: {
      getAllVisible: () => {
        return data.memories
          .filter(m => m.is_visible === 1 || m.is_visible === true)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      },
      getAll: () => {
        return [...data.memories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      },
      findById: (id) => {
        return data.memories.find(m => m.id === Number(id));
      },
      create: (fields) => {
        const nextId = data.memories.length > 0 ? Math.max(...data.memories.map(m => m.id)) + 1 : 1;
        const newMemory = {
          id: nextId,
          title: fields.title,
          description: fields.description || '',
          photo_url: fields.photo_url || null,
          date_of_memory: fields.date_of_memory || null,
          display_order: fields.display_order || 0,
          is_visible: fields.is_visible !== false ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        data.memories.push(newMemory);
        saveDb();
        return newMemory;
      },
      update: (id, fields) => {
        const mem = data.memories.find(m => m.id === Number(id));
        if (!mem) return null;
        if (fields.title !== undefined) mem.title = fields.title;
        if (fields.description !== undefined) mem.description = fields.description;
        if (fields.photo_url !== undefined) mem.photo_url = fields.photo_url;
        if (fields.date_of_memory !== undefined) mem.date_of_memory = fields.date_of_memory;
        if (fields.display_order !== undefined) mem.display_order = fields.display_order;
        if (fields.is_visible !== undefined) mem.is_visible = fields.is_visible ? 1 : 0;
        mem.updated_at = new Date().toISOString();
        saveDb();
        return mem;
      },
      delete: (id) => {
        const idx = data.memories.findIndex(m => m.id === Number(id));
        if (idx !== -1) {
          data.memories.splice(idx, 1);
          saveDb();
          return true;
        }
        return false;
      }
    },
    settings: {
      getAll: () => ({ ...data.site_settings }),
      get: (key) => data.site_settings[key],
      set: (key, value) => {
        data.site_settings[key] = String(value);
        saveDb();
        return { key, value: String(value) };
      },
      setMany: (settingsObj) => {
        for (const [key, value] of Object.entries(settingsObj)) {
          data.site_settings[key] = String(value);
        }
        saveDb();
        return { ...data.site_settings };
      }
    }
  };
}
