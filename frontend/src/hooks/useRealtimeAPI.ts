import { useState, useRef, useEffect, useCallback } from 'react';
import { getEphemeralToken } from '@/utils/apiCalls';

interface UseRealtimeAPIReturn {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    connect: (instructions?: string) => Promise<void>;
    disconnect: () => void;
    sendMessage: (message: any) => void;
}

export const useRealtimeAPI = (): UseRealtimeAPIReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    const connect = useCallback(async (instructions?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Get ephemeral token from your backend, passing instructions
            console.log(">>> Getting ephemeral token...");
            const tokenResponse = await getEphemeralToken(instructions);
            const token = tokenResponse.client_secret?.value || tokenResponse.token;
            
            if (!token) {
                throw new Error("No token received from backend");
            }
            console.log(">>> Token received");

            // 2. Create RTCPeerConnection
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

            // 3. Set up audio element for remote audio playback
            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            audioElementRef.current = audioEl;

            pc.ontrack = (event) => {
                console.log(">>> Received remote audio track");
                audioEl.srcObject = event.streams[0];
            };

            // 4. Get local microphone audio
            console.log(">>> Requesting microphone access...");
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            localStreamRef.current = localStream;

            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
            console.log(">>> Microphone connected");

            // 5. Create data channel for events
            const dc = pc.createDataChannel("oai-events");
            dcRef.current = dc;

            dc.onopen = () => {
                console.log(">>> Data channel open");
                setIsConnected(true);
            };

            dc.onclose = () => {
                console.log(">>> Data channel closed");
                setIsConnected(false);
            };

            dc.onmessage = (event) => {
                console.log(">>> Received message:", event.data);
                try {
                    const message = JSON.parse(event.data);
                    handleRealtimeEvent(message);
                } catch (e) {
                    console.error("Failed to parse message:", e);
                }
            };

            // 6. Create and set local offer
            console.log(">>> Creating offer...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 7. Send offer to OpenAI and get answer
            console.log(">>> Sending offer to OpenAI...");
            const sdpResponse = await fetch(
                "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
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
                const errorText = await sdpResponse.text();
                throw new Error(`OpenAI SDP error: ${sdpResponse.status} - ${errorText}`);
            }

            // 8. Set remote description with OpenAI's answer
            const answerSdp = await sdpResponse.text();
            const answer: RTCSessionDescriptionInit = {
                type: "answer",
                sdp: answerSdp,
            };
            await pc.setRemoteDescription(answer);
            console.log(">>> Connection established!");

        } catch (err) {
            console.error(">>> Connection error:", err);
            setError(err instanceof Error ? err.message : "Connection failed");
            disconnect();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (dcRef.current) {
            dcRef.current.close();
            dcRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (audioElementRef.current) {
            audioElementRef.current.srcObject = null;
            audioElementRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (dcRef.current && dcRef.current.readyState === "open") {
            dcRef.current.send(JSON.stringify(message));
        } else {
            console.warn("Data channel not open, cannot send message");
        }
    }, []);

    const handleRealtimeEvent = (event: any) => {
        switch (event.type) {
            case "session.created":
                console.log("Session created:", event);
                break;
            case "response.text.delta":
                console.log("Text delta:", event.delta);
                break;
            case "error":
                console.error("Realtime API error:", event.error);
                setError(event.error?.message || "Unknown error");
                break;
            default:
                console.log("Unhandled event:", event.type);
        }
    };

    return {
        isConnected,
        isLoading,
        error,
        connect,
        disconnect,
        sendMessage,
    };
};