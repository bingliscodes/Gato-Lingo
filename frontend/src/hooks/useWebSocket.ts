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

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus('disconnected');
      wsRef.current = null;

      // Attempt reconnect if not clean close
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts){
        reconnectAttempts.current += 1;
        console.log(`Reconnecting... attempt ${reconnectAttempts.current}`);
        setTimeout(connect, reconnectDelay);
      }
    };

    ws.onerror = (err) => {
      setConnectionStatus('disconnected')
      console.error('WebSocket error:', err)
    };

    wsRef.current = ws;
    }catch(err){
      console.error("Failed to create WebSocket:", err);
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