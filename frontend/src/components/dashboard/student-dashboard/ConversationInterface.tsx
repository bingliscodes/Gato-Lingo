import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { MessageList } from "@/components/MessageList";

interface Message {
  speaker: "student" | "tutor";
  text: string;
  timestamp: Date;
}

export interface ConversationInterfaceProps {
  sendMessage: (message: string) => void;
  wsMessages: string[];
  clearMessages: () => void;
  connectionStatus: "connecting" | "connected" | "disconnected";
  onEndSession: () => void;
}

const MicrophoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

export default function ConversationInterface({
  sendMessage,
  wsMessages,
  clearMessages,
  connectionStatus,
  onEndSession,
}: ConversationInterfaceProps) {
  const nav = useNavigate();

  // UI State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [wasResumed, setWasResumed] = useState(false);

  // Audio hooks
  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    error: recorderError,
  } = useAudioRecorder();
  const { playAudio, isPlaying } = useAudioPlayer();

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (wsMessages.length === 0) return;

    console.log(`>>> Processing ${wsMessages.length} messages`);

    wsMessages.forEach((rawData) => {
      try {
        const data = JSON.parse(rawData);
        console.log(">>> Processing message type:", data.type);

        switch (data.type) {
          case "tutor_message":
            setMessages((prev) => [
              ...prev,
              {
                speaker: "tutor",
                text: data.text,
                timestamp: new Date(),
              },
            ]);
            setIsTutorSpeaking(true);
            playAudio(data.audio).finally(() => setIsTutorSpeaking(false));
            break;

          case "transcript":
            console.log(">>> Adding student message:", data.text);
            setMessages((prev) => [
              ...prev,
              {
                speaker: "student",
                text: data.text,
                timestamp: new Date(),
              },
            ]);
            break;

          case "session_resumed":
            if (data.turns) {
              const restoredMessages: Message[] = data.turns.map(
                (turn: any) => ({
                  speaker: turn.speaker as "student" | "tutor",
                  text: turn.transcript,
                  timestamp: new Date(turn.timestamp),
                }),
              );
              setMessages(restoredMessages);
            }
            setWasResumed(true);
            setTimeout(() => setWasResumed(false), 3000);
            break;

          case "error":
            console.error("Server error:", data.message);
            break;

          case "session_ended":
            console.log("Session ended");
            break;
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    // Clear processed messages
    clearMessages();
  }, [wsMessages, clearMessages, playAudio]);

  // Send recorded audio when available
  useEffect(() => {
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      sendMessage(
        JSON.stringify({
          type: "audio",
          audio: base64,
        }),
      );
    };
    reader.readAsDataURL(audioBlob);
  }, [audioBlob, sendMessage]);

  // Handlers
  const handleEndSession = useCallback(() => {
    onEndSession();
    setMessages([]);
    nav("/dashboard");
  }, [onEndSession, nav]);

  const handleMouseDown = useCallback(() => {
    if (!isTutorSpeaking && !isPlaying) {
      startRecording();
    }
  }, [isTutorSpeaking, isPlaying, startRecording]);

  const handleMouseUp = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  return (
    <Box flex="1" display="flex" flexDirection="column" h="100vh">
      {/* Header */}
      <Box
        as="header"
        bg="bg.panel"
        boxShadow="sm"
        p={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="xl" fontWeight="semibold">
          Conversation Practice
        </Text>
        {connectionStatus === "disconnected" && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bg="red.500"
            color="white"
            p={2}
            textAlign="center"
            zIndex={1000}
          >
            Connection lost. Attempting to reconnect...
          </Box>
        )}
        {wasResumed && (
          <Box
            position="fixed"
            top={4}
            left="50%"
            transform="translateX(-50%)"
            bg="green.500"
            color="white"
            px={4}
            py={2}
            borderRadius="md"
            zIndex={1000}
          >
            Session resumed - {messages.length} previous messages loaded
          </Box>
        )}
        <Button colorPalette="red" variant="solid" onClick={handleEndSession}>
          End Session
        </Button>
      </Box>

      {/* Messages */}
      <MessageList messages={messages} isListening={isRecording} />

      {/* Recording controls */}
      <Box p={6} bg="bg.panel" boxShadow="lg">
        <VStack gap={3}>
          <Button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={isTutorSpeaking || isPlaying}
            w="80px"
            h="80px"
            borderRadius="full"
            colorPalette={isRecording ? "red" : "blue"}
            transform={isRecording ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
            _disabled={{
              bg: "gray.300",
              cursor: "not-allowed",
            }}
          >
            <MicrophoneIcon />
          </Button>

          <Text color="fg.muted" fontSize="sm">
            {isTutorSpeaking || isPlaying
              ? "Tutor is speaking..."
              : isRecording
                ? "Listening... Release to send"
                : "Hold to speak"}
          </Text>

          {recorderError && (
            <Text color="red.500" fontSize="sm">
              {recorderError}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
