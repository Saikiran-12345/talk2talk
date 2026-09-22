# 🚀 Talk2Talk — 100% FREE Deployment Guide (No Credit Card Required)

This guide shows how to deploy **Talk2Talk** online for **100% FREE without entering any payment or credit card details**, using **Render** and **Netlify**.

---

## 💳 Why Render & Netlify (No Credit Card Needed)?

Vercel sometimes requests a credit card verification for certain account types. **Render** and **Netlify** do **NOT** require any credit card or payment information to host your application for free!

---

## 🌟 Method 1: Deploy Everything on Render (100% Free, 1-Click Setup)

Render can deploy both your FastAPI Backend and React Frontend automatically using the included `render.yaml` configuration.

### Steps:
1. Open [Render Dashboard](https://dashboard.render.com).
2. Sign in using your **GitHub account**.
3. Click **New +** → **Blueprint**.
4. Select your repository: `Saikiran-12345/talk2talk`.
5. Render will detect `render.yaml` and create both services:
   - `talk2talk-backend` (FastAPI Python API)
   - `talk2talk-frontend` (React Static Site)
6. Click **Apply**.
7. Once deployed:
   - **Backend URL**: `https://talk2talk-backend.onrender.com`
   - **Frontend URL**: `https://talk2talk-frontend.onrender.com`
8. In Render Dashboard, click `talk2talk-frontend` → **Environment**, and set:
   - `VITE_API_URL` = `https://talk2talk-backend.onrender.com/api`
9. Click **Save Changes** (triggers automatic build).

---

## 🌟 Method 2: Netlify (Frontend) + Render (Backend)

### Step A: Deploy Backend on Render (100% Free, No Credit Card)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select repository `Saikiran-12345/talk2talk`.
4. Configure:
   - **Name**: `talk2talk-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `CORS_ORIGINS` = `*`
     - `DATABASE_URL` = `sqlite:///./talk2talk.db`
5. Click **Create Web Service**. Save your Backend URL (`https://talk2talk-backend.onrender.com`).

### Step B: Deploy Frontend on Netlify (100% Free, No Credit Card)
1. Go to [Netlify Dashboard](https://app.netlify.com).
2. Sign in with **GitHub**.
3. Click **Add new site** → **Import an existing project**.
4. Select `Saikiran-12345/talk2talk`.
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click **Environment variables** → Add:
   - `VITE_API_URL` = `https://talk2talk-backend.onrender.com/api`
7. Click **Deploy talk2talk**.

---

## 🎙 Microphone & HTTPS Notice

Both Render and Netlify automatically assign free SSL certificates (`https://`). Microphone access will work seamlessly on all phones and computers!
