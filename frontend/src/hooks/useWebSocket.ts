import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSocketReturn {
  sendMessage: (message: string) => void
  lastMessage: MessageEvent | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')
    }

    ws.onmessage = (event) => {
      setLastMessage(event)
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')
    }

    ws.onerror = () => {
      setConnectionStatus('disconnected')
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message)
    }
  }, [])

  return { sendMessage, lastMessage, connectionStatus }
}