"""
Fex TV Backend - FastAPI Server
Voice-powered movie recommendation system
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
from dotenv import load_dotenv
import json
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fex TV API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://*.railway.app",
        "https://*.render.com",
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TMDB API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Restaurant/Food API configuration
YELP_API_KEY = os.getenv("YELP_API_KEY", "")
YELP_BASE_URL = "https://api.yelp.com/v3"
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")

# Request models
class VoiceInput(BaseModel):
    text: str
    user_id: Optional[str] = None

class RecommendationRequest(BaseModel):
    query: str
    genres: Optional[List[str]] = None
    year: Optional[int] = None
    limit: int = 10

# TMDB API client
class TMDBClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = TMDB_BASE_URL
        self.session = httpx.AsyncClient(timeout=10.0)
    
    async def search_movies(self, query: str, page: int = 1) -> Dict[str, Any]:
        """Search movies by query"""
        try:
            url = f"{self.base_url}/search/movie"
            params = {
                "api_key": self.api_key,
                "query": query,
                "page": page,
                "language": "en-US"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB search error: {e}")
            return {"results": [], "total_results": 0}
    
    async def get_movie_details(self, movie_id: int) -> Dict[str, Any]:
        """Get detailed movie information"""
        try:
            url = f"{self.base_url}/movie/{movie_id}"
            params = {
                "api_key": self.api_key,
                "language": "en-US",
                "append_to_response": "videos,credits"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB details error: {e}")
            return {}
    
    async def discover_movies(self, genres: List[str] = None, year: int = None, page: int = 1, 
                             country: str = None, language: str = None) -> Dict[str, Any]:
        """Discover movies by genre, year, country, and language"""
        try:
            url = f"{self.base_url}/discover/movie"
            params = {
                "api_key": self.api_key,
                "language": language if language else "en-US",
                "sort_by": "popularity.desc",
                "page": page
            }
            
            if genres:
                # Get genre IDs from names
                genre_map = await self.get_genre_map()
                genre_ids = [genre_map.get(g.lower(), "") for g in genres if genre_map.get(g.lower())]
                if genre_ids:
                    params["with_genres"] = ",".join(map(str, genre_ids))
            
            if year:
                params["year"] = year
            
            # Add country/language filter
            if country:
                params["with_origin_country"] = country
            
            if language:
                params["with_original_language"] = language
            
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB discover error: {e}")
            return {"results": [], "total_results": 0}
    
    async def search_movies(self, query: str, page: int = 1, language: str = None) -> Dict[str, Any]:
        """Search movies by query with optional language filter"""
        try:
            url = f"{self.base_url}/search/movie"
            params = {
                "api_key": self.api_key,
                "query": query,
                "page": page,
                "language": language if language else "en-US"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB search error: {e}")
            return {"results": [], "total_results": 0}
    
    async def search_tv_shows(self, query: str, page: int = 1, language: str = None) -> Dict[str, Any]:
        """Search TV shows by query with optional language filter"""
        try:
            url = f"{self.base_url}/search/tv"
            params = {
                "api_key": self.api_key,
                "query": query,
                "page": page,
                "language": language if language else "en-US"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB TV search error: {e}")
            return {"results": [], "total_results": 0}
    
    async def discover_tv_shows(self, genres: List[str] = None, year: int = None, page: int = 1,
                               country: str = None, language: str = None) -> Dict[str, Any]:
        """Discover TV shows by genre, year, country, and language"""
        try:
            url = f"{self.base_url}/discover/tv"
            params = {
                "api_key": self.api_key,
                "language": language if language else "en-US",
                "sort_by": "popularity.desc",
                "page": page
            }
            
            if genres:
                genre_map = await self.get_genre_map()
                genre_ids = [genre_map.get(g.lower(), "") for g in genres if genre_map.get(g.lower())]
                if genre_ids:
                    params["with_genres"] = ",".join(map(str, genre_ids))
            
            if year:
                params["first_air_date_year"] = year
            
            if country:
                params["with_origin_country"] = country
            
            if language:
                params["with_original_language"] = language
            
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"TMDB TV discover error: {e}")
            return {"results": [], "total_results": 0}
    
    async def get_genre_map(self) -> Dict[str, int]:
        """Get genre name to ID mapping"""
        try:
            url = f"{self.base_url}/genre/movie/list"
            params = {"api_key": self.api_key, "language": "en-US"}
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return {genre["name"].lower(): genre["id"] for genre in data.get("genres", [])}
        except Exception as e:
            logger.error(f"Genre map error: {e}")
            return {}
    
    async def search_person(self, query: str) -> Dict[str, Any]:
        """Search for actors/people"""
        try:
            url = f"{self.base_url}/search/person"
            params = {
                "api_key": self.api_key,
                "query": query,
                "language": "en-US"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Person search error: {e}")
            return {"results": [], "total_results": 0}
    
    async def get_person_movies(self, person_id: int, include_tv: bool = True) -> Dict[str, Any]:
        """Get movies and TV shows for a person"""
        try:
            url = f"{self.base_url}/person/{person_id}/combined_credits"
            params = {
                "api_key": self.api_key,
                "language": "en-US"
            }
            response = await self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Combine movies and TV shows, sort by popularity
            all_credits = []
            if include_tv:
                all_credits.extend(data.get("cast", []))
            else:
                all_credits.extend([item for item in data.get("cast", []) if item.get("media_type") == "movie"])
            
            # Sort by popularity
            all_credits.sort(key=lambda x: x.get("popularity", 0), reverse=True)
            
            return {
                "results": all_credits[:20],  # Top 20
                "total_results": len(all_credits)
            }
        except Exception as e:
            logger.error(f"Person movies error: {e}")
            return {"results": [], "total_results": 0}
    
    async def close(self):
        await self.session.aclose()

# Restaurant/Food API Client
class RestaurantClient:
    def __init__(self, yelp_api_key: str = "", google_api_key: str = ""):
        self.yelp_api_key = yelp_api_key
        self.google_api_key = google_api_key
        self.session = httpx.AsyncClient(timeout=10.0)
    
    async def search_restaurants(self, location: str = "New York", term: str = "restaurant", 
                                 limit: int = 20) -> List[Dict[str, Any]]:
        """Search for nearby restaurants using Yelp API"""
        if not self.yelp_api_key:
            # Return mock data if no API key
            restaurants = self._get_mock_restaurants()
            # Filter by food type if specified
            if term and term != "restaurant":
                filtered = [r for r in restaurants if any(term.lower() in cat.lower() for cat in r.get("categories", []))]
                return filtered if filtered else restaurants[:6]  # Return filtered or first 6
            return restaurants
        
        try:
            url = f"{YELP_BASE_URL}/businesses/search"
            headers = {"Authorization": f"Bearer {self.yelp_api_key}"}
            params = {
                "term": term,
                "location": location,
                "limit": limit,
                "sort_by": "rating"
            }
            response = await self.session.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            restaurants = []
            for business in data.get("businesses", []):
                # Calculate distance (convert meters to miles)
                distance_miles = (business.get("distance", 0) / 1609.34) if business.get("distance") else None
                
                restaurants.append({
                    "id": business.get("id"),
                    "name": business.get("name"),
                    "image_url": business.get("image_url"),
                    "rating": business.get("rating"),
                    "price": business.get("price", "$$"),
                    "categories": [cat.get("title") for cat in business.get("categories", [])],
                    "address": ", ".join(business.get("location", {}).get("display_address", [])),
                    "distance": round(distance_miles, 1) if distance_miles else None,
                    "delivery_time": self._estimate_delivery_time(distance_miles),
                    "phone": business.get("display_phone"),
                    "url": business.get("url"),
                    "is_closed": business.get("is_closed", False)
                })
            
            return restaurants
        except Exception as e:
            logger.error(f"Yelp API error: {e}")
            # Return mock data on error
            return self._get_mock_restaurants()
    
    def _estimate_delivery_time(self, distance_miles: float = None) -> str:
        """Estimate delivery time based on distance"""
        if not distance_miles:
            return "25-35 min"
        if distance_miles < 1:
            return "15-25 min"
        elif distance_miles < 3:
            return "25-35 min"
        elif distance_miles < 5:
            return "35-45 min"
        else:
            return "45-60 min"
    
    def _get_mock_restaurants(self) -> List[Dict[str, Any]]:
        """Return mock restaurant data for demo"""
        return [
            {
                "id": "mock1",
                "name": "Pizza Palace",
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
                "rating": 4.5,
                "price": "$$",
                "categories": ["Pizza", "Italian", "Fast Food"],
                "address": "123 Main St, New York, NY",
                "distance": 0.8,
                "delivery_time": "20-30 min",
                "phone": "(555) 123-4567",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock2",
                "name": "Sushi Express",
                "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
                "rating": 4.7,
                "price": "$$$",
                "categories": ["Sushi", "Japanese", "Asian"],
                "address": "456 Broadway, New York, NY",
                "distance": 1.2,
                "delivery_time": "25-35 min",
                "phone": "(555) 234-5678",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock3",
                "name": "Burger House",
                "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
                "rating": 4.3,
                "price": "$",
                "categories": ["Burgers", "American", "Fast Food"],
                "address": "789 5th Ave, New York, NY",
                "distance": 0.5,
                "delivery_time": "15-25 min",
                "phone": "(555) 345-6789",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock4",
                "name": "Thai Garden",
                "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
                "rating": 4.6,
                "price": "$$",
                "categories": ["Thai", "Asian", "Vegetarian"],
                "address": "321 Park Ave, New York, NY",
                "distance": 1.5,
                "delivery_time": "30-40 min",
                "phone": "(555) 456-7890",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock5",
                "name": "Taco Fiesta",
                "image_url": "https://images.unsplash.com/photo-1565299585323-38174c2b7c1a?w=400",
                "rating": 4.4,
                "price": "$",
                "categories": ["Mexican", "Tacos", "Fast Food"],
                "address": "654 Lexington Ave, New York, NY",
                "distance": 0.9,
                "delivery_time": "20-30 min",
                "phone": "(555) 567-8901",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock6",
                "name": "Wings & Things",
                "image_url": "https://images.unsplash.com/photo-1527477396000-e27137b2a0e7?w=400",
                "rating": 4.2,
                "price": "$$",
                "categories": ["Wings", "American", "Sports Bar"],
                "address": "987 Madison Ave, New York, NY",
                "distance": 1.8,
                "delivery_time": "35-45 min",
                "phone": "(555) 678-9012",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock7",
                "name": "Spice Garden",
                "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
                "rating": 4.6,
                "price": "$$",
                "categories": ["Indian", "Curry", "Vegetarian"],
                "address": "555 Lexington Ave, New York, NY",
                "distance": 1.1,
                "delivery_time": "25-35 min",
                "phone": "(555) 789-0123",
                "url": "#",
                "is_closed": False
            },
            {
                "id": "mock8",
                "name": "Tandoor Express",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03246963d29b?w=400",
                "rating": 4.5,
                "price": "$$",
                "categories": ["Indian", "Tandoor", "Halal"],
                "address": "222 Park Ave, New York, NY",
                "distance": 0.7,
                "delivery_time": "20-30 min",
                "phone": "(555) 890-1234",
                "url": "#",
                "is_closed": False
            }
        ]
    
    async def close(self):
        await self.session.aclose()

# Initialize clients
tmdb_client = TMDBClient(TMDB_API_KEY)
restaurant_client = RestaurantClient(YELP_API_KEY, GOOGLE_PLACES_API_KEY)

# Intent extraction (simplified - will be replaced with Llama 3)
def extract_intent(text: str) -> Dict[str, Any]:
    """Extract movie preferences from user text"""
    text_lower = text.lower()
    
    # Actor detection - look for patterns like "with [actor]", "starring [actor]", "movies with [actor]"
    # Skip actor detection if this is clearly a food query
    actor = None
    food_indicators = ["food", "restaurant", "dinner", "lunch", "pizza", "burger", "sushi", "taco", "hungry", "eat", "meal", "snack"]
    is_likely_food = any(indicator in text_lower for indicator in food_indicators)
    
    if not is_likely_food:
        import re
        # Improved patterns to capture full names including hyphenated names
        # Pattern 1: "with/starring/featuring [Name Name-Name]"
        pattern1 = r'(?:with|starring|featuring)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z-]+)+)'
        match = re.search(pattern1, text)
        if match:
            potential_actor = match.group(1).strip()
            # Make sure it's not a food-related phrase
            if not any(word in potential_actor.lower() for word in ["food", "restaurant", "dinner", "pizza", "burger"]):
                actor = potential_actor
        
        # Pattern 2: "movies/films/shows with [Name Name-Name]"
        if not actor:
            pattern2 = r'(?:movies?|films?|shows?|dramas?)\s+(?:with|starring|featuring)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z-]+)+)'
            match = re.search(pattern2, text)
            if match:
                potential_actor = match.group(1).strip()
                if not any(word in potential_actor.lower() for word in ["food", "restaurant", "dinner", "pizza", "burger"]):
                    actor = potential_actor
        
        # Pattern 3: "[Name Name-Name] movies/films/shows"
        if not actor:
            pattern3 = r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z-]+)+)\s+(?:movies?|films?|shows?|dramas?)'
            match = re.search(pattern3, text)
            if match:
                potential_actor = match.group(1).strip()
                if not any(word in potential_actor.lower() for word in ["food", "restaurant", "dinner", "pizza", "burger"]):
                    actor = potential_actor
        
        # Pattern 4: "show me [Name Name-Name]" or "I want [Name Name-Name]" (but not food)
        if not actor:
            pattern4 = r'(?:show\s+me|find\s+me)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z-]+)+)'
            match = re.search(pattern4, text, re.IGNORECASE)
            if match:
                potential_actor = match.group(1).strip()
                if not any(word in potential_actor.lower() for word in ["food", "restaurant", "dinner", "pizza", "burger", "tv"]):
                    actor = potential_actor
        
        # If still no match, try to extract capitalized name sequences (but exclude food terms)
        if not actor:
            name_pattern = r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z-]+){1,2})\b'
            matches = re.findall(name_pattern, text)
            
            common_words = {"I", "The", "A", "An", "Movies", "Movie", "Films", "Film", 
                           "Shows", "Show", "Dramas", "Drama", "Korean", "Japanese", 
                           "Chinese", "Action", "Comedy", "Horror", "Sci-fi", "Food",
                           "Restaurant", "Dinner", "TV", "Tv"}
            
            for match in matches:
                words = match.split()
                # Skip if all words are common words or food-related
                if not all(word in common_words for word in words):
                    if not any(word in match.lower() for word in ["food", "restaurant", "dinner", "pizza", "burger", "tv"]):
                        if not actor or len(match) > len(actor):
                            actor = match.strip()
    
    # Country/Language detection
    country = None
    language = None
    country_keywords = {
        "korean": {"country": "KR", "language": "ko", "keywords": ["korean", "korea", "k-drama", "kdrama"]},
        "japanese": {"country": "JP", "language": "ja", "keywords": ["japanese", "japan", "anime"]},
        "chinese": {"country": "CN", "language": "zh", "keywords": ["chinese", "china", "mandarin"]},
        "indian": {"country": "IN", "language": "hi", "keywords": ["indian", "india", "bollywood", "hindi"]},
        "spanish": {"country": "ES", "language": "es", "keywords": ["spanish", "spain", "mexican"]},
        "french": {"country": "FR", "language": "fr", "keywords": ["french", "france"]},
        "german": {"country": "DE", "language": "de", "keywords": ["german", "germany"]},
    }
    
    for country_name, info in country_keywords.items():
        if any(keyword in text_lower for keyword in info["keywords"]):
            country = info["country"]
            language = info["language"]
            break
    
    # Genre detection
    genres = []
    genre_keywords = {
        "action": ["action", "fight", "combat", "thriller", "adventure"],
        "comedy": ["comedy", "funny", "humor", "laugh"],
        "drama": ["drama", "emotional", "serious", "deep", "dramas"],
        "horror": ["horror", "scary", "frightening", "terror"],
        "sci-fi": ["sci-fi", "science fiction", "space", "future", "alien"],
        "romance": ["romance", "romantic", "love", "relationship"],
        "fantasy": ["fantasy", "magic", "wizard", "dragon"],
        "crime": ["crime", "criminal", "gangster", "mafia"],
        "mystery": ["mystery", "detective", "investigation", "suspense"]
    }
    
    for genre, keywords in genre_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            genres.append(genre)
    
    # Year detection
    year = None
    import re
    year_match = re.search(r'\b(19|20)\d{2}\b', text)
    if year_match:
        year = int(year_match.group())
    
    # Mood detection
    mood = None
    if any(word in text_lower for word in ["sad", "depressed", "down"]):
        mood = "uplifting"
    elif any(word in text_lower for word in ["happy", "excited", "energetic"]):
        mood = "energetic"
    elif any(word in text_lower for word in ["relax", "calm", "peaceful"]):
        mood = "calm"
    
    # Food/Restaurant detection
    is_food_query = any(word in text_lower for word in [
        "food", "restaurant", "restaurants", "dinner", "lunch", "breakfast",
        "pizza", "burger", "sushi", "taco", "chinese", "italian", "mexican",
        "delivery", "takeout", "order", "hungry", "eat", "eating", "meal",
        "snack", "snacks", "tv dinner", "movie night food"
    ])
    
    # Extract food type/cuisine
    food_type = None
    cuisine_keywords = {
        "pizza": ["pizza"],
        "burger": ["burger", "burgers"],
        "sushi": ["sushi", "japanese"],
        "chinese": ["chinese"],
        "italian": ["italian", "pasta"],
        "mexican": ["mexican", "taco", "tacos"],
        "thai": ["thai"],
        "indian": ["indian", "curry"],
        "korean": ["korean food", "korean restaurant"],
        "fast food": ["fast food", "quick bite"]
    }
    
    for cuisine, keywords in cuisine_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            food_type = cuisine
            break
    
    return {
        "genres": genres if genres else None,
        "year": year,
        "mood": mood,
        "country": country,
        "language": language,
        "actor": actor,
        "is_food_query": is_food_query,
        "food_type": food_type,
        "original_text": text
    }

@app.get("/")
async def root():
    return {"message": "Fex TV API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fex-tv-api"}

@app.post("/api/voice/process")
async def process_voice(input: VoiceInput):
    """Process voice input and return recommendations"""
    try:
        logger.info(f"Processing voice input: {input.text}")
        
        # Extract intent
        intent = extract_intent(input.text)
        logger.info(f"Extracted intent: {intent}")
        
        # Check if this is a food query
        if intent.get("is_food_query"):
            logger.info("Food query detected, searching restaurants...")
            # Get user location (default to New York for demo, can be enhanced with geolocation)
            location = "New York"  # TODO: Get from user profile or geolocation
            term = intent.get("food_type") or "restaurant"
            
            restaurants = await restaurant_client.search_restaurants(
                location=location,
                term=term,
                limit=20
            )
            
            return {
                "success": True,
                "intent": intent,
                "type": "food",
                "restaurants": restaurants,
                "count": len(restaurants),
                "location": location
            }
        
        # Check if user is looking for TV shows (dramas, series, etc.)
        is_tv_show = any(word in input.text.lower() for word in ["drama", "dramas", "series", "tv show", "tv shows"])
        
        # Priority 1: Actor-based search
        if intent.get("actor"):
            logger.info(f"Searching for actor: {intent['actor']}")
            # Search for the actor
            person_results = await tmdb_client.search_person(intent["actor"])
            
            if person_results.get("results"):
                # Get the first (most relevant) person
                person = person_results["results"][0]
                person_id = person.get("id")
                person_name = person.get("name")
                
                logger.info(f"Found person: {person_name} (ID: {person_id})")
                
                # Get their movies/TV shows
                credits = await tmdb_client.get_person_movies(person_id, include_tv=is_tv_show or True)
                movies = credits.get("results", [])
                
                # Filter by country/language if specified
                if intent.get("country") or intent.get("language"):
                    filtered_movies = []
                    for movie in movies:
                        # Check origin country
                        if intent.get("country"):
                            origin_countries = movie.get("origin_country", [])
                            if intent["country"] not in origin_countries:
                                continue
                        # Check original language
                        if intent.get("language"):
                            if movie.get("original_language") != intent["language"]:
                                continue
                        filtered_movies.append(movie)
                    movies = filtered_movies[:10]
                else:
                    movies = movies[:10]
                
                # Format response
                recommendations = []
                for item in movies:
                    if item.get("media_type") == "tv" or "name" in item:
                        recommendations.append({
                            "id": item.get("id"),
                            "title": item.get("name") or item.get("title"),
                            "overview": item.get("overview", ""),
                            "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path', '')}" if item.get("poster_path") else None,
                            "release_date": item.get("first_air_date") or item.get("release_date"),
                            "vote_average": item.get("vote_average", 0),
                            "genre_ids": item.get("genre_ids", []),
                            "type": "tv" if item.get("media_type") == "tv" else "movie",
                            "actor_name": person_name
                        })
                    else:
                        recommendations.append({
                            "id": item.get("id"),
                            "title": item.get("title"),
                            "overview": item.get("overview", ""),
                            "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path', '')}" if item.get("poster_path") else None,
                            "release_date": item.get("release_date"),
                            "vote_average": item.get("vote_average", 0),
                            "genre_ids": item.get("genre_ids", []),
                            "type": "movie",
                            "actor_name": person_name
                        })
                
                return {
                    "success": True,
                    "intent": intent,
                    "recommendations": recommendations,
                    "count": len(recommendations),
                    "actor_found": person_name
                }
            else:
                # Actor not found, fall through to regular search
                logger.warning(f"Actor '{intent['actor']}' not found, using regular search")
        
        # Get recommendations
        # Priority: If country/language specified, use discover with filters
        # Otherwise, try genre-based discovery or text search
        if intent.get("country") or intent.get("language"):
            if is_tv_show:
                # Search for TV shows
                tv_data = await tmdb_client.discover_tv_shows(
                    genres=intent.get("genres"),
                    year=intent.get("year"),
                    country=intent.get("country"),
                    language=intent.get("language")
                )
                # If no results, try text search
                if not tv_data.get("results"):
                    search_query = input.text
                    if "korean" in input.text.lower() or "korea" in input.text.lower():
                        search_query = "Korean drama"
                    tv_data = await tmdb_client.search_tv_shows(
                        search_query,
                        language=intent.get("language")
                    )
                movies_data = tv_data
            else:
                # Search for movies
                movies_data = await tmdb_client.discover_movies(
                    genres=intent.get("genres"),
                    year=intent.get("year"),
                    country=intent.get("country"),
                    language=intent.get("language")
                )
                # If no results, try text search with language
                if not movies_data.get("results"):
                    search_query = input.text
                    if "korean" in input.text.lower() or "korea" in input.text.lower():
                        search_query = "Korean"
                    movies_data = await tmdb_client.search_movies(
                        search_query,
                        language=intent.get("language")
                    )
        elif intent["genres"]:
            if is_tv_show:
                movies_data = await tmdb_client.discover_tv_shows(
                    genres=intent["genres"],
                    year=intent["year"]
                )
            else:
                movies_data = await tmdb_client.discover_movies(
                    genres=intent["genres"],
                    year=intent["year"]
                )
        else:
            if is_tv_show:
                movies_data = await tmdb_client.search_tv_shows(input.text)
            else:
                movies_data = await tmdb_client.search_movies(input.text)
        
        movies = movies_data.get("results", [])[:10]
        
        # Format response (handle both movies and TV shows)
        recommendations = []
        for item in movies:
            # TV shows use different field names
            if "name" in item:  # TV show
                recommendations.append({
                    "id": item.get("id"),
                    "title": item.get("name"),  # TV shows use "name"
                    "overview": item.get("overview", ""),
                    "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path', '')}" if item.get("poster_path") else None,
                    "release_date": item.get("first_air_date"),  # TV shows use "first_air_date"
                    "vote_average": item.get("vote_average"),
                    "genre_ids": item.get("genre_ids", []),
                    "type": "tv"
                })
            else:  # Movie
                recommendations.append({
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "overview": item.get("overview", ""),
                    "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path', '')}" if item.get("poster_path") else None,
                    "release_date": item.get("release_date"),
                    "vote_average": item.get("vote_average"),
                    "genre_ids": item.get("genre_ids", []),
                    "type": "movie"
                })
        
        return {
            "success": True,
            "intent": intent,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error processing voice input: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/movies/search")
async def search_movies(request: RecommendationRequest):
    """Search movies with filters"""
    try:
        if request.genres:
            movies_data = await tmdb_client.discover_movies(
                genres=request.genres,
                year=request.year
            )
        else:
            movies_data = await tmdb_client.search_movies(request.query)
        
        movies = movies_data.get("results", [])[:request.limit]
        
        recommendations = []
        for movie in movies:
            recommendations.append({
                "id": movie.get("id"),
                "title": movie.get("title"),
                "overview": movie.get("overview", ""),
                "poster_path": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path', '')}" if movie.get("poster_path") else None,
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average"),
            })
        
        return {
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error searching movies: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movies/{movie_id}")
async def get_movie_details(movie_id: int):
    """Get detailed movie information"""
    try:
        movie = await tmdb_client.get_movie_details(movie_id)
        return {
            "success": True,
            "movie": movie
        }
    except Exception as e:
        logger.error(f"Error getting movie details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/genres")
async def get_genres():
    """Get list of available genres"""
    try:
        genre_map = await tmdb_client.get_genre_map()
        return {
            "success": True,
            "genres": genre_map
        }
    except Exception as e:
        logger.error(f"Error getting genres: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/restaurants")
async def get_restaurants(location: str = "New York", term: str = "restaurant", limit: int = 20):
    """Get nearby restaurants"""
    try:
        restaurants = await restaurant_client.search_restaurants(
            location=location,
            term=term,
            limit=limit
        )
        return {
            "success": True,
            "restaurants": restaurants,
            "count": len(restaurants),
            "location": location
        }
    except Exception as e:
        logger.error(f"Error getting restaurants: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown():
    await tmdb_client.close()
    await restaurant_client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

