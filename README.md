# RiskLens AI — Enterprise Risk Analytics Dashboard

> A full-stack MERN application featuring a dark-mode analytics dashboard with real-time risk monitoring, Recharts visualisations, geographic exposure maps, client registry, and an editorial landing page.

---

## ✨ Features

- **Landing Page** — editorial dark-mode hero with scroll animations, stats ticker, and feature grid
- **Overview** — KPI cards, revenue area chart, product mix pie, live alerts & recent transactions
- **Risk Map** — client risk score distribution, geographic exposure bar chart, top-risk client list
- **Clients** — searchable/filterable/sortable table with inline risk score bars
- **Analytics** — monthly revenue + growth rate dual-axis chart, industry breakdown, product line pie
- **Reports** — document library with status badges + portfolio summary panel
- **Settings** — account profile, security, notification preferences, API config

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/risklens-dashboard.git
cd risklens-dashboard
```

### 2. Install dependencies
```bash
# Install client deps
cd client && npm install && cd ..

# Install server deps
cd server && npm install && cd ..
```

### 3. Configure environment variables
```bash
# Server
cp server/.env.example server/.env
# Open server/.env and fill in your real MongoDB URI and JWT secret

# Client
cp client/.env.example client/.env
# VITE_APP_BASE_URL is already set to http://localhost:5001
```

### 4. Seed the database (run once)
```bash
node server/seed.js
```

### 5. Start the dev stack
```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, IBM Plex Mono, Syne |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| State | Redux Toolkit (RTK Query) |
| Styling | Vanilla CSS-in-JS (inline styles) |

---

## 📁 Project Structure

```
/client          # React + Vite frontend
  /src
    /pages       # LandingPage.jsx, Dashboard.jsx
    /scenes      # Original MUI scenes (legacy)
    /state       # Redux store & RTK Query API
/server          # Express backend
  /models        # Mongoose schemas
  /routes        # API route handlers
  /data          # Static seed data
  seed.js        # Database seeder
  index.js       # Server entry point
```

---

## 🌐 Deploy

### Vercel (Frontend) + Render (Backend)

1. Push this repo to GitHub
2. **Frontend on Vercel:**
   - Connect the repo, set Root Directory to `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add env var: `VITE_APP_BASE_URL=<your-render-backend-url>`
3. **Backend on Render:**
   - New Web Service → connect repo, Root Directory: `server`
   - Start Command: `npm start`
   - Add env vars: `MONGO_URL`, `PORT`, `JWT_SECRET`

---

## 📄 License

MIT © 2026 Manas Gupta
