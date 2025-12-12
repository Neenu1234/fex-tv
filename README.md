# 🎬 Fex TV - Voice-Powered Movie & Food Recommendation System

A conversational AI-powered platform that recommends movies and restaurants based on voice input. Built with modern web technologies and AI integration.

![Fex TV](https://img.shields.io/badge/Fex-TV-red) ![Python](https://img.shields.io/badge/Python-3.9+-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)

## 🎥 Demo Video

**👉 [Watch Demo Video](demo-video.mov)** *(Click to download and watch)*

[![Demo Video](https://img.shields.io/badge/▶️-Watch%20Demo-red)](demo-video.mov)

> **Note**: The demo video shows the complete workflow of Fex TV, including voice input, movie recommendations, and food search features.

---

## 🎯 Features

### 🎤 Voice-Powered Search
- **Natural Language Input**: Speak your preferences in plain English
- **Multi-Modal Support**: Text, voice, and image inputs
- **Intelligent Intent Extraction**: Understands genres, actors, countries, and more

### 🎬 Movie Recommendations
- **Real-Time Data**: Powered by TMDB API with 500k+ movies
- **Actor-Based Search**: "Movies with Tom Cruise" or "Leonardo DiCaprio films"
- **Country/Language Filtering**: "Korean dramas", "Japanese anime", "Bollywood movies"
- **Genre Detection**: Automatically identifies sci-fi, comedy, horror, etc.
- **Year Filtering**: "Action movies from 2020"

### 🍽️ Food Recommendations
- **Nearby Restaurants**: Find restaurants for your TV dinner night
- **Cuisine-Specific**: "I want Indian food", "Show me pizza restaurants"
- **Restaurant Details**: Ratings, prices, delivery time, distance
- **Netflix-Style UI**: Beautiful restaurant cards matching movie design

### 🎨 User Interface
- **Netflix-Inspired Design**: Modern, dark theme with smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-Time Updates**: Live transcript and recommendations
- **Intuitive Navigation**: Easy-to-use voice interface

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Web Speech API** - Browser-based voice recognition

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.9+** - Backend language
- **TMDB API** - Movie database integration
- **Yelp API** - Restaurant data (optional)

### AI/ML
- **Intent Extraction** - Natural language understanding
- **Pattern Recognition** - Genre, actor, country detection
- **Smart Filtering** - Multi-criteria recommendation engine

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- TMDB API Key (free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Neenu1234/fex-tv.git
   cd fex-tv
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Create .env file
   echo "TMDB_API_KEY=your_api_key_here" > .env
   ```

4. **Start Backend**
   ```bash
   uvicorn main:app --reload
   ```
   Backend runs on http://localhost:8000

5. **Setup Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Start Frontend**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

### Usage

1. Open http://localhost:3000 in Chrome or Edge
2. Click the microphone button 🎤
3. Speak your preference:
   - "I want to watch a sci-fi movie"
   - "Show me Korean dramas"
   - "Movies with Tom Cruise"
   - "I want Indian food for my TV dinner"
4. Click "Get Recommendations"
5. View results!

---

## 📝 Example Voice Commands

### Movies
- "I want to watch a sci-fi movie"
- "Show me action movies from 2020"
- "Korean dramas with Park Seo-joon"
- "I'm feeling sad, recommend something funny"
- "Find me a horror movie"
- "Show me Leonardo DiCaprio movies"

### Food
- "I want food for my TV dinner"
- "Show me nearby pizza restaurants"
- "I want Indian food"
- "I'm hungry, find me food"
- "Order food for movie night"

---

## 🏗️ Project Structure

```
fex-tv/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main UI component
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── package.json         # Node dependencies
│   └── next.config.js       # Next.js config
├── README.md                # This file
└── QUICKSTART.md            # Quick start guide
```

---

## 🎓 Key Features for Resume

### System Design
- ✅ Microservices architecture (Frontend/Backend separation)
- ✅ RESTful API design
- ✅ Real-time voice processing
- ✅ Intelligent intent extraction

### AI/ML Integration
- ✅ Natural Language Understanding
- ✅ Pattern recognition and classification
- ✅ Multi-criteria recommendation engine
- ✅ Context-aware search

### Full-Stack Development
- ✅ Modern frontend (Next.js, TypeScript)
- ✅ High-performance backend (FastAPI)
- ✅ API integration (TMDB, Yelp)
- ✅ Responsive UI/UX design

### Production-Ready
- ✅ Error handling and logging
- ✅ Environment configuration
- ✅ CORS and security
- ✅ Scalable architecture

---

## 📊 API Endpoints

### Voice Processing
```
POST /api/voice/process
Body: {"text": "I want to watch a sci-fi movie"}
Response: Movie recommendations with intent extraction
```

### Movie Search
```
POST /api/movies/search
Body: {"query": "action", "genres": ["action"], "year": 2020}
Response: Filtered movie recommendations
```

### Restaurant Search
```
POST /api/voice/process
Body: {"text": "I want pizza"}
Response: Nearby restaurant recommendations
```

### Health Check
```
GET /health
Response: {"status": "healthy", "service": "fex-tv-api"}
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
TMDB_API_KEY=your_tmdb_api_key
YELP_API_KEY=your_yelp_api_key  # Optional
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Next Steps & Future Roadmap

### 🛒 E-Commerce Integration
- **Voice-Ordering System**: Complete food ordering directly from the TV using voice commands
  - "Order pizza from [restaurant name]"
  - "Add 2 burgers and fries to cart"
  - "Checkout my order"
- **Payment Integration**: Secure payment processing via voice or TV remote
  - Stripe/PayPal integration for seamless transactions
  - Voice-based payment confirmation
  - Saved payment methods for quick checkout
- **Order Tracking**: Real-time order status updates displayed on TV
  - Live delivery tracking map
  - Estimated arrival time
  - Order history and receipts

### 🎯 Enhanced Personalization
- **User Profiles & Authentication**: Multi-user support with personalized recommendations
  - Individual watch histories and preferences
  - Family profiles with parental controls
  - Cross-device synchronization
- **AI-Powered Recommendations**: Advanced ML models for better suggestions
  - Collaborative filtering based on viewing patterns
  - Sentiment analysis of movie reviews
  - Vector embeddings for semantic movie matching
- **Mood-Based Discovery**: Context-aware recommendations
  - "I'm feeling stressed" → Comedy/Relaxing content
  - Time-of-day based suggestions (morning vs. night)
  - Weather-based recommendations

### 🎬 Content Features
- **Watchlist & Favorites**: Save movies and shows for later
- **Continue Watching**: Resume where you left off
- **Trailer Integration**: Watch trailers directly from recommendations
- **Streaming Service Links**: Direct links to Netflix, Hulu, Prime Video, etc.
- **Group Watch**: Synchronized viewing with friends/family remotely

### 🍽️ Food & Dining Enhancements
- **Recipe Recommendations**: Cooking suggestions based on movie theme
  - "What should I cook while watching Italian movies?"
- **Meal Planning**: Weekly meal plans based on viewing schedule
- **Dietary Preferences**: Filter restaurants by dietary restrictions (vegan, keto, etc.)
- **Group Ordering**: Split bills and coordinate orders with friends
- **Loyalty Programs**: Points and rewards for frequent orders

### 🤖 Advanced AI Features
- **Conversational Memory**: Remember previous conversations and preferences
- **Multi-Turn Dialogues**: "Show me more like that" or "What about comedies?"
- **Contextual Understanding**: Understand follow-up questions without repetition
- **Llama 3 Integration**: Local LLM for better natural language understanding
- **Voice Cloning**: Personalized voice assistant with user's voice

### 📱 Platform Expansion
- **Mobile App**: React Native app for iOS and Android
- **Smart TV Apps**: Native apps for Roku, Apple TV, Fire TV
- **Chrome Extension**: Browser extension for quick recommendations
- **API Marketplace**: Public API for developers to build integrations

### 🎨 UI/UX Improvements
- **Gesture Controls**: Hand gestures for navigation (using camera)
- **Dark/Light Mode**: Theme switching based on time of day
- **Accessibility**: Voice navigation for visually impaired users
- **Multi-Language Support**: Internationalization for global users
- **AR/VR Integration**: Immersive movie preview experiences

### 🔐 Security & Privacy
- **End-to-End Encryption**: Secure voice data transmission
- **Privacy Controls**: Granular data sharing preferences
- **GDPR Compliance**: Data protection and user rights
- **Biometric Authentication**: Face/fingerprint recognition for payments

### 📊 Analytics & Insights
- **Viewing Analytics**: Personal viewing statistics and insights
- **Recommendation Explanations**: "Why we recommended this"
- **Trend Analysis**: Popular movies and food in your area
- **Social Features**: Share recommendations with friends

### 🌐 Integration Ecosystem
- **Smart Home Integration**: Control lights, temperature based on movie mood
- **Calendar Integration**: Schedule movie nights and food orders
- **Fitness Tracking**: Suggest active movies after workout sessions
- **Social Media**: Share watchlists and reviews on social platforms

---

## 🤝 Contributing

This is a capstone project. Contributions and suggestions are welcome!

---

## 📄 License

MIT License - Feel free to use this project for learning purposes.

---

## 👨‍💻 Author

**Neenu Santhosh**
- GitHub: [@Neenu1234](https://github.com/Neenu1234)
- Email: santhosh.n@northeastern.edu

---

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie data
- [Yelp](https://www.yelp.com/developers) for restaurant API
- Next.js and FastAPI communities

---

## 📸 Screenshots

*Add screenshots of your application here*

---

**Built with ❤️ for the capstone project**
