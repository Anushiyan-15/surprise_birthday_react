# 🎂 Birthday Surprise Website

A romantic, animated birthday surprise web application for couples — featuring 3D animations, a personalized birthday letter, a photo memories gallery, and a full admin dashboard.

---

## ✨ Features

### Public Pages
- **Landing Page** — 3D animated spinning heart with romantic particle effects
- **Birthday Page** — Interactive 3D birthday cake with candle lighting + confetti
- **Memories Page** — Birthday letter in an envelope + photo memories gallery

### Admin Dashboard
- Login with JWT authentication
- Edit the birthday letter
- Add / edit / delete couple memories & upload photos
- Customize colors, fonts, and themes
- Update personalization (name, site title, subtitle)
- Change admin password

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (you have v22 ✅)
- **npm** v9+

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Backend Server
```bash
cd server
npm start
```
Server runs at **http://localhost:3001**

### 3. Start the Frontend (in a new terminal)
```bash
cd client
npm run dev
```
Frontend runs at **http://localhost:5173**

---

## 🔐 Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `birthday2024` |

> ⚠️ **Change your password** immediately after first login via the admin panel Settings tab.

**Admin URL:** http://localhost:5173/admin/login

---

## 📁 Project Structure

```
birthday-wish/
├── server/                 # Node.js Express backend
│   ├── db/
│   │   └── init.js         # SQLite database initialization
│   ├── routes/
│   │   ├── auth.js         # Login, JWT verification
│   │   ├── memories.js     # CRUD for memories
│   │   ├── settings.js     # Site settings
│   │   └── upload.js       # Photo upload (Multer)
│   ├── uploads/            # Uploaded photos (auto-created)
│   ├── data/               # SQLite database (auto-created)
│   └── index.js            # Server entry point
│
└── client/                 # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── Heart3D.jsx          # 3D heart (Three.js)
    │   │   ├── BirthdayCake3D.jsx   # 3D cake with candles
    │   │   └── FloatingParticles.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx      # Page 1: Home
    │   │   ├── BirthdayPage.jsx     # Page 2: Cake animation
    │   │   ├── MemoriesPage.jsx     # Page 3: Letter + Gallery
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       └── AdminDashboard.jsx
    │   ├── store/
    │   │   └── useStore.js          # Zustand global state
    │   ├── App.jsx
    │   └── index.css
    └── vite.config.js
```

---

## 🎨 Customizing Content

### Via Admin Panel (recommended)
1. Go to http://localhost:5173/admin/login
2. Login with admin credentials
3. Use the sidebar tabs to:
   - ✏️ Edit the birthday letter
   - 📸 Add memory photos
   - 🎨 Change colors and theme
   - ⚙️ Update names and site title

### Via Database defaults (server/db/init.js)
Edit the `defaultSettings` array in `init.js` before first run.

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Animations | Framer Motion |
| State | Zustand |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT, bcryptjs |
| File Upload | Multer |

---

## 📦 Deployment

### Option 1: Single Server (Recommended)
Build the frontend and serve it from Express:

```bash
cd client && npm run build
```

Add to `server/index.js`:
```js
app.use(express.static('../client/dist'))
app.get('*', (req, res) => res.sendFile('../client/dist/index.html'))
```

### Option 2: Vercel + Railway
- Deploy `client/` on Vercel
- Deploy `server/` on Railway
- Update the API base URL in the client

---

## ❤️ Made with love
