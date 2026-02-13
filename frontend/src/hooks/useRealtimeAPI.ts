// hooks/useRealtimeAPI.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { getEphemeralToken, type ConversationTurn } from '@/utils/apiCalls';



interface RealtimeEvent {
    type: string;
    transcript?: string;
    delta?: string;
    error?:{
        message: string;
    };
    [key: string]: any;
}

interface UseRealtimeAPIReturn {
    isConnected: boolean;
    isLoading: boolean;
    userIsSpeaking: boolean;
    error: string | null;
    connect: (instructions?: string) => Promise<void>;
    disconnect: () => void;
    sendEvent: (event: RealtimeEvent) => void;
    conversationHistory: ConversationTurn[];
}

export const useRealtimeAPI = (): UseRealtimeAPIReturn => {
    // Connection state:
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // UI State
    const [userIsSpeaking, setUserIsSpeaking] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])

    // Transcript tracking refs
    const currentStudentResponse = useRef<string>('');
    const currentAssistantResponse = useRef<string>('');

    // WebRTC objects (refs because they don't need to trigger re-renders)
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => disconnect();
    }, []);

    const connect = useCallback(async (instructions?: string) => {
        setIsLoading(true);
        setError(null);
        setConversationHistory([]);
        currentStudentResponse.current = '';
        currentAssistantResponse.current = '';

        try {
            // ========================================
            // STEP 1: Get ephemeral token from backend
            // ========================================
            console.log("1. Getting ephemeral token...");
            const tokenData = await getEphemeralToken(instructions);
            const token = tokenData.value;
            
            if (!token) {
                throw new Error("No token in response");
            }

            // ========================================
            // STEP 2: Create WebRTC peer connection
            // ========================================
            console.log("2. Creating RTCPeerConnection...");
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

            // ========================================
            // STEP 3: Set up audio playback
            // ========================================
            console.log("3. Setting up audio playback...");
            const audio = document.createElement('audio');
            audio.autoplay = true;
            audioRef.current = audio;

            // When we receive audio from OpenAI, play it
            pc.ontrack = (event) => {
                console.log("Received audio track from OpenAI");
                audio.srcObject = event.streams[0];
            };

            // ========================================
            // STEP 4: Get microphone and add to connection
            // ========================================
            console.log("4. Getting microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Add microphone audio to the connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // ========================================
            // STEP 5: Create data channel for events
            // ========================================
            console.log("5. Creating data channel...");
            const dc = pc.createDataChannel("oai-events");
            dcRef.current = dc;

            dc.onopen = () => {
                console.log("Data channel opened!");
                setIsConnected(true);
            };

            dc.onclose = () => {
                console.log("Data channel closed");
                setIsConnected(false);
            };

            dc.onmessage = (event) => {
                handleServerEvent(JSON.parse(event.data));
            };

            // ========================================
            // STEP 6: Create SDP offer
            // ========================================
            console.log("6. Creating SDP offer...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // ========================================
            // STEP 7: Send offer to OpenAI, get answer
            // ========================================
            console.log("7. Sending offer to OpenAI...");
            const sdpResponse = await fetch(
                `https://api.openai.com/v1/realtime/calls`,
                {
                    method: "POST",
                    body: offer.sdp,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/sdp",
                    },
                }
            );

            if (!sdpResponse.ok) {
                throw new Error(`SDP request failed: ${sdpResponse.status}`);
            }

            // ========================================
            // STEP 8: Set OpenAI's answer
            // ========================================
            console.log("8. Setting remote description...");
            const answerSdp = await sdpResponse.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

            console.log("✅ Connected to OpenAI Realtime API!");

        } catch (err) {
            console.error("Connection failed:", err);
            setError(err instanceof Error ? err.message : "Connection failed");
            disconnect();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        console.log("Disconnecting...");

        if (dcRef.current) {
            dcRef.current.close();
            dcRef.current = null;
        }

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.srcObject = null;
            audioRef.current = null;
        }
        
        setIsConnected(false);
        
    }, []);

    const sendEvent = useCallback((event: RealtimeEvent) => {
        if (dcRef.current?.readyState === "open") {
            console.log("Sending event:", event.type);
            dcRef.current.send(JSON.stringify(event));
        } else {
            console.warn("Cannot send - data channel not open");
        }
    }, []);

    const handleServerEvent = (event: RealtimeEvent) => {
        switch (event.type) {
            // User started speaking
            case "input_audio_buffer.speech_started":
                setUserIsSpeaking(true);
                currentStudentResponse.current = '';
                console.log("User started speaking")
                break;

            // User stopped speaking
            case "input_audio_buffer.speech_stopped":
                setUserIsSpeaking(false);
                console.log("User stopped speaking");
                break;
            
            // Transcript of what user said
            case "conversation.item.input_audio_transcription.completed":
                const userText = event.transcript || '';
                currentStudentResponse.current = userText;
                console.log("User said: ", userText);
                break;
            
            // AI finished responding transcribing audio
            case "response.output_audio_transcript.done":
                const assistantText = event.transcript || '';
                const userMessage = currentStudentResponse.current;

                setConversationHistory(prev => {
                    const newHistory = [...prev];

                    if (userMessage){
                        newHistory.push({
                            speaker: "student",
                            transcript: userMessage,
                            timestamp: new Date().toISOString()
                        });
                    }
                    if (assistantText){
                        newHistory.push({
                            speaker: "tutor",
                            transcript: assistantText,
                            timestamp: new Date().toISOString()
                        });
                    }
                    return newHistory
                })
                // Reset for next turn
                currentStudentResponse.current = '';
                currentAssistantResponse.current = '';
                break;

            // Session started
            case "session.created":
                console.log("Session created!");
                break;

            // Error
            case "error":
                console.error("API Error:", event.error);
                setError(event.error?.message || "Unknown error");
                break;

            default:
                // Lots of events we don't need to handle
                break;
        }
    };

    return {
        isConnected,
        isLoading,
        error,
        connect,
        disconnect,
        sendEvent,
        conversationHistory,
        userIsSpeaking,
    };
};