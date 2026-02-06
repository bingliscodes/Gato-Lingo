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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  const connect = useCallback(() => {
    try{
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      };

       ws.onmessage = (event) => {
      setLastMessage(event)
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')
    }

    ws.onerror = (err) => {
      setConnectionStatus('disconnected')
      console.error('WebSocket error:', err)
    }

    wsRef.current = ws;
    }catch(err){
      console.error("Failed to create WebSocket:", error);
      setConnectionStatus("disconnected");
    }
  }, [url])

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current){
        wsRef.current.close(1000, "Component unmounted");
      }
    }
  },[connect])

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message)
    }else{
      console.warn("WebSocket not connected, message not sent");
    }
  }, [])

  return { sendMessage, lastMessage, connectionStatus }
}