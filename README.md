# 🌿 MirAI

**MirAI** is an AI-powered plant companion app that helps users keep their plants alive through smart feedback, simple plant scans, and a friendly avatar that grows as they care for real plants.

---

## 🧭 Overview

**Architecture:**
```

Frontend (React + Tailwind)
↓
Express Backend (Node.js)
↓
Plant.id API + Supabase

````

---

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/NotAPlumber505/MirAI.git
cd MirAI
npm i
npm i react-router-dom
npm i tailwindcss @tailwindcss/vite

````

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
PLANT_ID_API_KEY=your_api_key_here
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=your_public_key_here
PORT=5000
```

> ⚠️ **Add `.env.local` to `.gitignore`** to keep your keys private.

### 3. Run the App

**Frontend:**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Backend:**

```bash
cd backend
npm start
```

Runs on [http://localhost:5000](http://localhost:5000)

---

## 🗄️ Supabase Setup

In your Supabase project, create these tables:

* **users:** id, username, avatar_level, streak_count
* **plants:** id, user_id, name, species, image_url, health_status, last_scan_date
* **scans:** id, plant_id, ai_confidence, feedback_text, timestamp

Copy your Supabase URL + public key into `.env.local`.

---

## 🌱 Git Guidelines

* ✅ **Always commit before pulling:**

  ```bash
  git add .
  git commit -m "save progress"
  git pull origin main
  ```

* 🌿 **Use feature branches:**

  ```bash
  git checkout -b feature/home-page
  git push origin feature/home-page
  ```

* 🔒 **Never commit API keys or `.env` files.**

---

## 💡 Test the App

Upload a plant photo → view name, species, confidence, health, and feedback → save to *My Plants*.

---

##**Made with 💚 by the MirAI Team**
