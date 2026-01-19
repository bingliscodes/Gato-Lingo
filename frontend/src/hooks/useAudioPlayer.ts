import { useState, useCallback, useRef } from 'react'

interface UseAudioPlayerReturn {
  playAudio: (base64Audio: string) => Promise<void>
  isPlaying: boolean
  stop: () => void
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = useCallback(async (base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        const audioData = atob(base64Audio)
        const audioArray = new Uint8Array(audioData.length)
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i)
        }
        
        const blob = new Blob([audioArray], { type: 'audio/mp3' })
        const url = URL.createObjectURL(blob)
        
        const audio = new Audio(url)
        audioRef.current = audio
        
        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onerror = (e) => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
          reject(e)
        }
        
        audio.play()
      } catch (err) {
        reject(err)
      }
    })
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }, [])

  return { playAudio, isPlaying, stop }
}