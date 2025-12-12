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
  const wakeWords = ['hello', 'hey', 'hi']

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
          
          console.log('Wake word listening:', currentTranscript) // Debug
          
          // Check for wake word - more flexible matching
          let detectedWakeWord = false
          let matchedWakeWord = ''
          
          for (const wakeWord of wakeWords) {
            // Check if wake word appears in transcript
            if (currentTranscript.includes(wakeWord)) {
              detectedWakeWord = true
              matchedWakeWord = wakeWord
              break
            }
            // Also check for variations (e.g., "fex tv" vs "fex t v")
            const wakeWordVariations = [
              wakeWord,
              wakeWord.replace(' ', ''),
              wakeWord.replace(' ', ' t '),
              wakeWord + ' ',
              ' ' + wakeWord
            ]
            if (wakeWordVariations.some(variation => currentTranscript.includes(variation))) {
              detectedWakeWord = true
              matchedWakeWord = wakeWord
              break
            }
          }
          
          if (detectedWakeWord && !isListening) {
            console.log('Wake word detected:', matchedWakeWord) // Debug
            // Wake word detected, start main recognition
            try {
              wakeWordRecognition.stop()
            } catch (e) {
              // Ignore
            }
            
            // Extract query after wake word
            let queryAfterWakeWord = currentTranscript
            const index = currentTranscript.indexOf(matchedWakeWord)
            if (index !== -1) {
              queryAfterWakeWord = currentTranscript.substring(index + matchedWakeWord.length).trim()
            }
            
            // Start main recognition
            setTimeout(() => {
              if (recognitionRef.current) {
                setTranscript('')
                setRecommendations([])
                setRestaurants([])
                setResultType(null)
                setError('')
                setIsWaitingForWakeWord(false)
                try {
                  recognitionRef.current.start()
                  // If there's text after wake word, set it
                  if (queryAfterWakeWord) {
                    setTimeout(() => {
                      setTranscript(queryAfterWakeWord)
                      transcriptRef.current = queryAfterWakeWord
                    }, 200)
                  }
                } catch (e) {
                  console.error('Error starting recognition:', e)
                }
              }
            }, 200)
          }
        }

        wakeWordRecognition.onerror = (event: any) => {
          // Ignore 'no-speech' errors (normal when waiting)
          if (event.error === 'no-speech') {
            // This is normal, just continue listening
            return
          }
          console.error('Wake word recognition error:', event.error)
          // Restart on other errors
          if (event.error !== 'aborted' && !isListening) {
            setTimeout(() => {
              try {
                wakeWordRecognition.start()
              } catch (e) {
                // Ignore
              }
            }, 1000)
          }
        }

        wakeWordRecognition.onend = () => {
          // Restart wake word recognition if we're waiting for wake word
          setTimeout(() => {
            if (!isListening) {
              try {
                wakeWordRecognition.start()
              } catch (e) {
                // Already started, ignore
              }
            }
          }, 100)
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
          // Restart wake word recognition after a delay
          setTimeout(() => {
            setIsWaitingForWakeWord(true)
            if (wakeWordRecognitionRef.current) {
              try {
                wakeWordRecognitionRef.current.start()
              } catch (e) {
                // Already started, ignore
              }
            }
          }, 1000)
        }

        recognitionRef.current = recognition

        // Start wake word recognition - requires user interaction first
        // So we'll start it when user clicks the button or page loads after interaction
        const startWakeWord = () => {
          if (wakeWordRecognitionRef.current) {
            try {
              wakeWordRecognitionRef.current.start()
              console.log('Wake word recognition started') // Debug
              setIsWaitingForWakeWord(true)
            } catch (e: any) {
              if (e.message && e.message.includes('already started')) {
                console.log('Wake word already started') // Debug
              } else {
                console.log('Wake word start error:', e) // Debug
                // If it fails, user might need to interact first
                // We'll start it when they click the button
              }
            }
          }
        }

        // Try to start wake word recognition
        // Note: Some browsers require user interaction first
        const tryStartWakeWord = () => {
          setTimeout(() => {
            startWakeWord()
          }, 500)
        }

        // Start after page load
        tryStartWakeWord()

        // Also start when user clicks anywhere (for browsers that require interaction)
        const handleUserInteraction = () => {
          if (isWaitingForWakeWord && !isListening && wakeWordRecognitionRef.current) {
            try {
              wakeWordRecognitionRef.current.start()
            } catch (e) {
              // Ignore
            }
          }
          // Remove listener after first interaction
          document.removeEventListener('click', handleUserInteraction)
          document.removeEventListener('touchstart', handleUserInteraction)
        }
        document.addEventListener('click', handleUserInteraction)
        document.addEventListener('touchstart', handleUserInteraction)
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
    // Also start wake word recognition in background for next time
    setTimeout(() => {
      if (wakeWordRecognitionRef.current && !isListening) {
        try {
          wakeWordRecognitionRef.current.start()
          setIsWaitingForWakeWord(true)
        } catch (e) {
          // Ignore
        }
      }
    }, 1000)
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
              title={isWaitingForWakeWord ? "Say 'Hello' to activate" : isListening ? 'Stop listening' : 'Click to activate'}
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
                      ? "Say 'Hello' to activate (or click microphone)"
                      : 'Click microphone or say "Hello" to start'}
                  </p>
                  <p className="text-gray-500 text-lg">
                    {isWaitingForWakeWord 
                      ? '👂 Listening for "Hello"...' 
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

