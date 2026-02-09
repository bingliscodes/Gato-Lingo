import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSocketReturn {
  sendMessage: (message: string) => void
  messages: string[]
  clearMessages: () => void
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [messages, setMessages] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const isUnmounted = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;


  const connect = useCallback(() => {
    if (isUnmounted.current){
      return;
    }

    if (wsRef.current && 
            (wsRef.current.readyState === WebSocket.CONNECTING || 
             wsRef.current.readyState === WebSocket.OPEN)) {
            return;
        }

    try {
        const ws = new WebSocket(url);

        ws.onopen = () => {
          if (isUnmounted.current){
            ws.close();
            return;
          }
            setConnectionStatus("connected");
            reconnectAttempts.current = 0;
        };

        ws.onmessage = (event) => {
          console.log(">>> WS onmessage:", event.data.substring(0, 50));
          if (!isUnmounted.current){
            setMessages(prev => [...prev, event.data]);
          };
        };

        ws.onclose = (event) => {
            if (isUnmounted.current) return;

            setConnectionStatus('disconnected');
            wsRef.current = null;

            if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current += 1;
                setTimeout(connect, reconnectDelay);
            }
        };

        ws.onerror = (err) => {
            console.error('>>> WebSocket ERROR:', err);
            if (!isUnmounted.current){
              setConnectionStatus('disconnected');
            }
        };

        wsRef.current = ws;
        
    } catch (err) {
        console.error(">>> Failed to create WebSocket:", err);
        if (!isUnmounted.current){
          setConnectionStatus("disconnected");
        }
    }
}, [url]);


  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      console.log(">>> Cleanup: closing WebSocket");
      isUnmounted.current = true;
      if (wsRef.current){
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    }
  },[connect])

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(">>> Sending message");
      wsRef.current.send(message);
    }else{
      console.warn(">>> WebSocket not connected, message not sent. ReadyState:", wsRef.current?.readyState);
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return { sendMessage, messages, clearMessages, connectionStatus }
}