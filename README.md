# Fex TV - Voice-Powered Movie Recommendation System

A conversational movie recommendation platform where users speak their preferences and get intelligent movie suggestions.

## 🎯 Features

- 🎤 **Voice Input**: Speak your movie preferences
- 🤖 **AI Understanding**: Llama 3 extracts intent and preferences
- 🎬 **Smart Recommendations**: ML-based movie suggestions
- 🎨 **Netflix-Style UI**: Beautiful, modern interface
- 💰 **100% Free**: All open-source tools, no costs

## 🛠️ Tech Stack

### Frontend
- React + Next.js
- Tailwind CSS
- Web Speech API
- Socket.io

### Backend
- FastAPI (Python)
- Llama 3 (Ollama)
- TMDB API
- Qdrant (Vector DB)
- PostgreSQL
- Redis

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
fex-tv/
├── backend/          # FastAPI server
├── frontend/         # Next.js app
├── data/            # Data files, configs
└── README.md
```

## 🎬 How It Works

1. User speaks movie preference
2. Speech → Text (Web Speech API)
3. Text → Intent (Llama 3)
4. Intent → Movie Search (TMDB + Vector Search)
5. Recommendations → Display (Netflix-style UI)

## 📝 License

MIT

