// hooks/useRealtimeAPI.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { getEphemeralToken, gradeConversationSession, type ConversationTurn } from '@/utils/apiCalls';



interface RealtimeEvent {
    type: string;
    [key: string]: any;
}

interface UseRealtimeAPIReturn {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    connect: (instructions?: string) => Promise<void>;
    disconnect: () => void;
    sendEvent: (event: RealtimeEvent) => void;
    transcript: string;  // What the user said
    response: string;    // What the AI said
    conversationHistory: ConversationTurn[];
}

export const useRealtimeAPI = (): UseRealtimeAPIReturn => {
    // UI State
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');

    // Conversation Transcript
    const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])
    const currentUserTranscript = useRef<string>('');
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
        setTranscript('');
        setResponse('');

        try {
            // ========================================
            // STEP 1: Get ephemeral token from backend
            // ========================================
            console.log("1. Getting ephemeral token...");
            const tokenData = await getEphemeralToken(instructions);
            const token = tokenData.client_secret?.value;
            
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
            const model = "gpt-4o-transcribe";
            const sdpResponse = await fetch(
                `https://api.openai.com/v1/realtime?model=${model}`,
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

            // Transcript of what user said
            case "conversation.item.input_audio_transcription.completed":
                const userText = event.transcript || '';
                currentUserTranscript.current = userText;
                setTranscript(userText);    

                if (userText){
                    setConversationHistory(prev => [...prev, {
                        speaker: "student",
                        transcript: userText,
                        timestamp: new Date(),
                    }])
                }
                break;
            
             // AI is responding with text
            case "response.audio_transcript.delta":
                currentAssistantResponse.current += (event.delta || '');
                setResponse(currentAssistantResponse.current);
                break;

            // AI finished responding
            case "response.audio_transcript.done":
            case "response.done":
                const assistantText = currentAssistantResponse.current;
                if (assistantText){
                    setConversationHistory(prev => [...prev, {
                        speaker: "tutor",
                        transcript: assistantText,
                        timestamp: new Date(),
                    }]);
                }
                currentAssistantResponse.current = '';
                break;

            // Session started
            case "session.created":
                console.log("Session created!");
                break;

            // User started speaking
            case "input_audio_buffer.speech_started":
                console.log("User started speaking");
                setTranscript('');
                break;

            // User stopped speaking
            case "input_audio_buffer.speech_stopped":
                console.log("User stopped speaking");
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
        transcript,
        response,
        conversationHistory,
    };
};