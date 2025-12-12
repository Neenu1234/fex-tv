# Fex TV - Deployment Guide

## 🚀 Quick Deploy to Share with Professor

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended

#### Backend Deployment (Render)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Deploy Backend**
   - Click "New" → "Web Service"
   - Connect your GitHub repo (or push code to GitHub first)
   - Settings:
     - **Name**: `fex-tv-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: `backend`

3. **Add Environment Variables** (in Render dashboard):
   ```
   TMDB_API_KEY=18ac861b3450176191ef45b5050daff4
   YELP_API_KEY=(optional - leave empty for mock data)
   ```

4. **Get Backend URL**
   - Render will give you: `https://fex-tv-backend.onrender.com`

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub (free)

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repo
   - Settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://fex-tv-backend.onrender.com
   ```

4. **Deploy**
   - Vercel will give you: `https://fex-tv.vercel.app`

### Option 2: All-in-One (Railway) - Easier

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub (free $5 credit/month)

2. **Deploy Backend**
   - New Project → Deploy from GitHub
   - Select repo → Add Service
   - Settings:
     - **Root Directory**: `backend`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables:
     ```
     TMDB_API_KEY=18ac861b3450176191ef45b5050daff4
     ```

3. **Deploy Frontend**
   - Add another service in same project
   - Settings:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=(your backend URL from Railway)
     ```

### Option 3: Quick Demo (GitHub Pages + Render)

For fastest deployment, we can create a static version or use simpler hosting.

## 📝 Pre-Deployment Checklist

- [ ] Push code to GitHub
- [ ] Backend environment variables set
- [ ] Frontend API URL configured
- [ ] Test both services locally
- [ ] Update CORS settings for production URLs

## 🔧 Quick Fixes Needed

1. **Update CORS in backend** (for production):
   ```python
   allow_origins=["http://localhost:3000", "https://your-frontend.vercel.app"]
   ```

2. **Update frontend API URL**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

## 🎯 Recommended: Railway (Easiest)

Railway is the easiest - one platform, simple setup, free tier.

Would you like me to:
1. Set up Railway deployment configs?
2. Create a GitHub repo and push code?
3. Guide you through deployment step-by-step?

