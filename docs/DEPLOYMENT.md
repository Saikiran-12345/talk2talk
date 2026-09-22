# 🚀 Talk2Talk — Production Deployment Guide

This guide details how to deploy **Talk2Talk** online for free using **Render** or **Vercel** with GitHub integration (`https://github.com/Saikiran-12345/talk2talk.git`).

---

## 🛠 Hosting Architecture Overview

- **Backend**: Deployed as a Python Web Service on **Render** (or Railway / Koyeb).
- **Frontend**: Deployed as a Static Site on **Vercel** or **Render Static Site**.
- **HTTPS & Security**: Automatic SSL certificate provided by Vercel/Render (required for browser microphone permissions).
- **GitHub Integration**: Pushing code updates to branch `main` automatically redeploys both Frontend and Backend on the exact same public URL!

---

## 📋 Option 1: 1-Click Render Blueprint Deployment (Recommended)

Render can deploy both the Backend API and Frontend Static Site automatically using the included `render.yaml` file.

### Step 1: Push Code to GitHub
Ensure all code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure production deployment settings"
git push origin main
```

### Step 2: Deploy on Render Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository `https://github.com/Saikiran-12345/talk2talk.git`.
4. Render will detect `render.yaml` and display two services:
   - `talk2talk-backend` (Python Web Service)
   - `talk2talk-frontend` (Static Site)
5. Click **Apply**.
6. Once deployed:
   - Backend URL will be: `https://talk2talk-backend.onrender.com`
   - Frontend URL will be: `https://talk2talk-frontend.onrender.com`

### Step 3: Configure Frontend Environment Variable
1. In Render Dashboard, click `talk2talk-frontend` → **Environment**.
2. Add environment variable:
   - `VITE_API_URL` = `https://talk2talk-backend.onrender.com/api`
3. Click **Save Changes** (this will trigger a automatic redeploy).

---

## 📋 Option 2: Deploy Frontend on Vercel + Backend on Render

### Step 1: Deploy Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Select repository `Saikiran-12345/talk2talk`.
3. Set configuration:
   - **Name**: `talk2talk-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `CORS_ORIGINS`: `*` (or your frontend Vercel URL `https://talk2talk.vercel.app`)
   - `DATABASE_URL`: `sqlite:///./talk2talk.db`
5. Click **Create Web Service**. Note your Backend URL (e.g. `https://talk2talk-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com) → **Add New** → **Project**.
2. Import repository `Saikiran-12345/talk2talk`.
3. Set configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://talk2talk-backend.onrender.com/api`
5. Click **Deploy**.
6. Note your Public Application URL (e.g. `https://talk2talk.vercel.app`).

---

## 🎙 Browser Microphone & HTTPS Permissions

1. Open your public HTTPS application URL (`https://<your-frontend-url>`).
2. When prompted by the browser, click **Allow** for Microphone access.
3. Because the site is served over **HTTPS**, microphone permissions will work natively on desktop and mobile browsers (Chrome, Edge, Safari, Firefox).

---

## 🔄 Future Updates Workflow

Whenever you make code modifications in the future, simply run:

```bash
git add .
git commit -m "Add new features or fixes"
git push origin main
```

Render / Vercel will automatically build and deploy your changes within 1-2 minutes on the **exact same public URL**. Your friends will immediately see the updated version without needing a new link!
