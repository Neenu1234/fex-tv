'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Image from 'next/image'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  type?: string
}

interface Restaurant {
  id: string
  name: string
  image_url: string
  rating: number
  price: string
  categories: string[]
  address: string
  distance: number | null
  delivery_time: string
  phone: string
  url: string
  is_closed: boolean
}

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [resultType, setResultType] = useState<'movies' | 'food' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<string>('')

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
          setError('')
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
          setTranscript(currentTranscript)
          transcriptRef.current = currentTranscript
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
          // Auto-process when user finishes speaking
          const finalTranscript = transcriptRef.current.trim()
          if (finalTranscript) {
            setTimeout(() => {
              processVoiceInput(finalTranscript)
            }, 300) // Small delay to ensure state is updated
          }
        }

        recognitionRef.current = recognition
      } else {
        setError('Speech recognition not supported in this browser')
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setRecommendations([])
      setRestaurants([])
      setResultType(null)
      setError('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceInput = async (textToProcess?: string) => {
    const text = textToProcess || transcript
    if (!text.trim()) {
      setError('Please speak your movie preference first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE}/api/voice/process`, {
        text: text,
      })

      if (response.data.success) {
        if (response.data.type === 'food') {
          // Food/restaurant results
          setRestaurants(response.data.restaurants || [])
          setRecommendations([])
          setResultType('food')
        } else {
          // Movie results
          setRecommendations(response.data.recommendations || [])
          setRestaurants([])
          setResultType('movies')
        }
      } else {
        setError('Failed to get recommendations')
      }
    } catch (err: any) {
      console.error('Error processing voice input:', err)
      setError(err.response?.data?.detail || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <header className="fixed top-0 w-full px-16 py-5 bg-gradient-to-b from-black to-transparent z-50 flex justify-between items-center">
        <h1 className="text-4xl font-black text-netflix-red tracking-tight">FEX TV</h1>
        <nav className="flex gap-6">
          <a href="#" className="text-gray-300 hover:text-white text-sm">Home</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm">Movies</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm">My List</a>
        </nav>
      </header>

      {/* Transcript at Top */}
      {transcript && (
        <section className="pt-24 pb-8 px-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/70 rounded-lg p-6 border border-gray-800">
              <p className="text-gray-400 text-sm mb-2">You said:</p>
              <p className="text-white text-xl font-medium">{transcript}</p>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Voice Input */}
      <section className="relative min-h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
        <div className="relative z-20 text-center px-8 max-w-4xl">
          {!transcript && (
            <>
              <h2 className="text-6xl font-black mb-6">Speak Your Movie Preference</h2>
              <p className="text-xl text-gray-300 mb-8">
                Tell us what you want to watch, and we'll find the perfect movies for you
              </p>
            </>
          )}

          {/* Voice Input Section */}
          <div className="bg-black/70 rounded-lg p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Voice Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
                  isListening
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-netflix-red hover:bg-red-700'
                }`}
              >
                {isListening ? '⏹️' : '🎤'}
              </button>

              <p className="text-gray-400">
                {isListening ? 'Listening... Speak now' : transcript ? 'Click to search again' : 'Click to start speaking'}
              </p>

              {/* Error Message */}
              {error && (
                <div className="w-full bg-red-900/50 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section - Movies */}
      {resultType === 'movies' && recommendations.length > 0 && (
        <section className="px-16 py-12 min-h-[50vh] flex flex-col justify-center">
          <h3 className="text-3xl font-bold mb-8 text-center">Recommended Movies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recommendations.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transform transition-transform hover:scale-110"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  {movie.poster_path ? (
                    <Image
                      src={movie.poster_path}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-semibold truncate">{movie.title}</h4>
                <p className="text-xs text-gray-400">
                  {movie.release_date?.split('-')[0]} • ⭐ {movie.vote_average.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations Section - Restaurants */}
      {resultType === 'food' && restaurants.length > 0 && (
        <section className="px-16 py-12 min-h-[50vh] flex flex-col justify-center">
          <h3 className="text-3xl font-bold mb-8 text-center">🍽️ Nearby Restaurants for Your TV Dinner</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group cursor-pointer transform transition-transform hover:scale-110"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  <Image
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  {restaurant.is_closed && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Closed
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-semibold truncate">{restaurant.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400">⭐ {restaurant.rating}</span>
                  <span className="text-green-400">{restaurant.price}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {restaurant.distance ? `${restaurant.distance} mi` : ''} • {restaurant.delivery_time}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {restaurant.categories.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Finding perfect movies for you...</p>
          </div>
        </div>
      )}
    </div>
  )
}

