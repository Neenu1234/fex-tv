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
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [resultType, setResultType] = useState<'movies' | 'food' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wakeWordRecognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<string>('')
  const wakeWords = ['fex tv', 'flex tv', 'flev tv', 'fex television']

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        // Wake word recognition (continuous listening)
        const wakeWordRecognition = new SpeechRecognition()
        wakeWordRecognition.continuous = true
        wakeWordRecognition.interimResults = true
        wakeWordRecognition.lang = 'en-US'

        wakeWordRecognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
            .toLowerCase()
          
          // Check for wake word
          const detectedWakeWord = wakeWords.some(wakeWord => 
            currentTranscript.includes(wakeWord)
          )
          
          if (detectedWakeWord && !isListening) {
            // Wake word detected, start main recognition
            wakeWordRecognition.stop()
            startMainRecognition()
          }
        }

        wakeWordRecognition.onerror = (event: any) => {
          // Ignore errors for wake word recognition, just restart
          if (event.error !== 'no-speech') {
            console.error('Wake word recognition error:', event.error)
          }
        }

        wakeWordRecognition.onend = () => {
          // Restart wake word recognition if we're waiting for wake word
          if (isWaitingForWakeWord && !isListening) {
            setTimeout(() => {
              try {
                wakeWordRecognition.start()
              } catch (e) {
                // Already started, ignore
              }
            }, 100)
          }
        }

        wakeWordRecognitionRef.current = wakeWordRecognition

        // Main recognition (for actual queries)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
          setIsWaitingForWakeWord(false)
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
          setIsWaitingForWakeWord(true)
          // Restart wake word recognition
          setTimeout(() => {
            try {
              wakeWordRecognition.start()
            } catch (e) {
              // Already started, ignore
            }
          }, 500)
        }

        recognition.onend = () => {
          setIsListening(false)
          // Auto-process when user finishes speaking
          const finalTranscript = transcriptRef.current.trim()
          if (finalTranscript) {
            setTimeout(() => {
              processVoiceInput(finalTranscript)
            }, 300)
          }
          // Restart wake word recognition
          setIsWaitingForWakeWord(true)
          setTimeout(() => {
            try {
              wakeWordRecognition.start()
            } catch (e) {
              // Already started, ignore
            }
          }, 500)
        }

        recognitionRef.current = recognition

        // Start wake word recognition
        const startWakeWord = () => {
          try {
            wakeWordRecognition.start()
          } catch (e) {
            // Already started, ignore
          }
        }

        // Start listening for wake word
        setTimeout(startWakeWord, 1000)
      } else {
        setError('Speech recognition not supported in this browser')
      }
    }
  }, [])

  const startMainRecognition = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setRecommendations([])
      setRestaurants([])
      setResultType(null)
      setError('')
      setIsWaitingForWakeWord(false)
      recognitionRef.current.start()
    }
  }

  const startListening = () => {
    // Stop wake word recognition and start main recognition
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.stop()
      } catch (e) {
        // Ignore
      }
    }
    startMainRecognition()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    // Restart wake word recognition
    setIsWaitingForWakeWord(true)
    setTimeout(() => {
      if (wakeWordRecognitionRef.current) {
        try {
          wakeWordRecognitionRef.current.start()
        } catch (e) {
          // Already started, ignore
        }
      }
    }, 500)
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

      {/* Voice Input Section at Top */}
      <section className="pt-24 pb-8 px-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/70 rounded-lg p-6 border border-gray-800 flex items-center gap-4">
            {/* Microphone Button - Top Left */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 animate-pulse'
                  : isWaitingForWakeWord
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-netflix-red hover:bg-red-700'
              }`}
              title={isWaitingForWakeWord ? "Say 'Fex TV' to activate" : isListening ? 'Stop listening' : 'Click to activate'}
            >
              {isListening ? '⏹️' : isWaitingForWakeWord ? '👂' : '🎤'}
            </button>

            {/* Transcript Box */}
            <div className="flex-1">
              {transcript ? (
                <>
                  <p className="text-gray-400 text-sm mb-2">You said:</p>
                  <p className="text-white text-xl font-medium">{transcript}</p>
                </>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    {isListening 
                      ? 'Listening... Speak now' 
                      : isWaitingForWakeWord
                      ? "Say 'Fex TV' to activate"
                      : 'Click microphone or say "Fex TV" to start'}
                  </p>
                  <p className="text-gray-500 text-lg">
                    {isWaitingForWakeWord 
                      ? 'Waiting for wake word...' 
                      : 'Speak your movie or food preference...'}
                  </p>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            {isListening && (
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
            {isWaitingForWakeWord && !isListening && (
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Hero Section - Welcome Message (only when no transcript) */}
      {!transcript && !loading && (
        <section className="relative min-h-[40vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
          <div className="relative z-20 text-center px-8 max-w-4xl">
            <h2 className="text-6xl font-black mb-6">Speak Your Movie Preference</h2>
            <p className="text-xl text-gray-300 mb-8">
              Tell us what you want to watch, and we'll find the perfect movies for you
            </p>
          </div>
        </section>
      )}

      {/* Recommendations Section - Movies */}
      {resultType === 'movies' && recommendations.length > 0 && (
        <section className="px-16 py-8">
          <h3 className="text-3xl font-bold mb-8">Recommended Movies</h3>
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
        <section className="px-16 py-8">
          <h3 className="text-3xl font-bold mb-8">🍽️ Nearby Restaurants for Your TV Dinner</h3>
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

