# Fex TV Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- TMDB API Key (free from https://www.themoviedb.org/settings/api)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your TMDB API key to `.env`:
```
TMDB_API_KEY=your_api_key_here
```

6. Run the server:
```bash
uvicorn main:app --reload
```

Backend will run on http://localhost:8000

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Testing

1. Open http://localhost:3000
2. Click the microphone button
3. Speak your movie preference (e.g., "I want to watch a sci-fi movie")
4. Click "Get Recommendations"
5. View recommended movies!

## API Endpoints

- `GET /health` - Health check
- `POST /api/voice/process` - Process voice input
- `POST /api/movies/search` - Search movies
- `GET /api/movies/{id}` - Get movie details
- `GET /api/genres` - Get available genres

## Troubleshooting

### Speech Recognition Not Working
- Use Chrome or Edge browser (best support)
- Allow microphone permissions
- Check browser console for errors

### No Recommendations
- Verify TMDB API key is set correctly
- Check backend logs for errors
- Ensure backend is running on port 8000

### CORS Errors
- Make sure backend CORS settings include frontend URL
- Check that both servers are running

