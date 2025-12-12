# 🚀 Quick Deploy - Share with Professor

## Easiest Method: Railway (Recommended)

### Step 1: Push to GitHub

```bash
cd /Users/neenubonny/Downloads/fex-tv
git init
git add .
git commit -m "Initial commit - Fex TV project"
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/fex-tv.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway

1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `fex-tv` repo
5. Add Service → Select `backend` folder
6. Settings:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Go to Variables tab, add:
   ```
   TMDB_API_KEY=18ac861b3450176191ef45b5050daff4
   ```
8. Copy the generated URL (e.g., `https://fex-tv-backend.railway.app`)

### Step 3: Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (free)
3. Click "New Project" → Import your `fex-tv` repo
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://fex-tv-backend.railway.app
   ```
   (Use the URL from Step 2)
6. Click Deploy
7. Get your frontend URL (e.g., `https://fex-tv.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to Railway backend service
2. Add environment variable:
   ```
   FRONTEND_URL=https://fex-tv.vercel.app
   ```
3. Redeploy

### Step 5: Share with Professor! 🎉

Your app will be live at: `https://fex-tv.vercel.app`

## Alternative: All on Railway

If you prefer one platform:

1. Deploy backend (same as above)
2. Add frontend as second service in Railway
3. Set `NEXT_PUBLIC_API_URL` to backend URL
4. Both will be on Railway

## What You'll Get

- ✅ Public URL to share
- ✅ Works on any device
- ✅ No local setup needed
- ✅ Free hosting (with limits)

## Troubleshooting

- **CORS errors**: Make sure frontend URL is in backend CORS settings
- **API not working**: Check environment variables are set
- **Build fails**: Check logs in deployment platform

