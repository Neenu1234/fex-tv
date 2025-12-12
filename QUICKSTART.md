# Fex TV - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Get TMDB API Key (Free)
1. Go to https://www.themoviedb.org/
2. Sign up for a free account
3. Go to Settings → API
4. Request an API key (instant approval for free tier)
5. Copy your API key

### Step 2: Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:
```bash
echo "TMDB_API_KEY=your_api_key_here" > .env
```

Start backend:
```bash
uvicorn main:app --reload
```

✅ Backend running on http://localhost:8000

### Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on http://localhost:3000

### Step 4: Test It!

1. Open http://localhost:3000 in Chrome or Edge
2. Click the microphone button 🎤
3. Say: **"I want to watch a sci-fi movie"**
4. Click "Get Recommendations"
5. See your movie recommendations! 🎬

## 🎤 Example Voice Commands

- "I want to watch a comedy movie"
- "Show me action movies from 2020"
- "I'm feeling sad, recommend something funny"
- "Find me a horror movie"
- "I want to watch something romantic"

## 🐛 Troubleshooting

**Speech not working?**
- Use Chrome or Edge (best support)
- Allow microphone permissions
- Check browser console

**No recommendations?**
- Verify TMDB API key in `.env`
- Check backend is running (http://localhost:8000/health)
- Check browser console for errors

**CORS errors?**
- Make sure backend is running
- Check CORS settings in `backend/main.py`

## 📚 Next Steps

- Add Llama 3 for better intent understanding
- Implement vector search for semantic recommendations
- Add user preferences and personalization
- Deploy to production

Happy coding! 🎉

