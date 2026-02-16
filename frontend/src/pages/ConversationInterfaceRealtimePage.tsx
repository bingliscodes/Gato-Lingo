import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Box, Text, Button, VStack } from "@chakra-ui/react";

import { useRealtimeAPI } from "@/hooks/useRealtimeAPI";
import {
  type StudentAssignmentResponse,
  getExamData,
  gradeConversationSession,
} from "@/utils/apiCalls";
import { MessageList } from "@/components/MessageList";

const MicrophoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

export default function ConversationInterfaceRealtimePage() {
  const { sessionId } = useParams();
  const nav = useNavigate();

  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
  const [isGradingExam, setIsGradingExam] = useState(false);
  const [errorGradingExam, setErrorGradingExam] = useState<string | null>(null);
  const [examGrade, setExamGrade] = useState<string>("");
  const [isLoadingExamData, setIsLoadingExamData] = useState(true);
  const [errorLoadingExamData, setErrorLoadingExamData] = useState<
    string | null
  >(null);

  // Always call the hook at the top level (React rules)
  const {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    conversationHistory,
    userIsSpeaking,
  } = useRealtimeAPI();

  // Load exam data on mount
  useEffect(() => {
    async function loadExamDataAsync() {
      try {
        const data = await getExamData(sessionId);
        setExamData(data);
      } catch (err) {
        setErrorLoadingExamData(
          err instanceof Error ? err.message : "Failed to load exam",
        );
      } finally {
        setIsLoadingExamData(false);
      }
    }
    loadExamDataAsync();
  }, [sessionId]);

  // Handle connect with instructions
  const handleConnect = () => {
    if (examData?.exam.conversation_prompt) {
      connect(examData.exam.conversation_prompt);
    }
  };

  const handleEndSession = async () => {
    setIsGradingExam(true);
    try {
      const res = await gradeConversationSession(
        conversationHistory,
        sessionId,
      );
      setExamGrade(res);
      setIsGradingExam(false);
      disconnect();
      nav("/dashboard");
    } catch (err) {
      setErrorGradingExam(
        err instanceof Error ? err.message : "Failed to grade exam",
      );
    } finally {
      setIsGradingExam(false);
    }
  };

  // Show loading state for exam data
  if (isLoadingExamData) {
    return <div>Loading exam data...</div>;
  }

  if (errorLoadingExamData) {
    return <div>Error loading exam: {errorLoadingExamData}</div>;
  }

  if (!examData) {
    return <div>No exam data found</div>;
  }

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
          Exam: {examData.exam.title}
        </Text>

        {
          // TODO: figure out how to handle dc/rc with new model
          /* {!isConnected && (
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
        )} */
        }

        {!isConnected && (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Start Conversation"}
          </Button>
        )}
        {isConnected && (
          <p style={{ marginTop: 20 }}>
            🎤 Speak into your microphone - the tutor should respond!
          </p>
        )}
        <Button bgColor="red.300" variant="solid" onClick={handleEndSession}>
          End Session
        </Button>
      </Box>
      <MessageList
        messages={conversationHistory}
        isListening={userIsSpeaking}
      />
      {/* Recording controls */}
      <Box p={6} bg="bg.panel" boxShadow="lg">
        <VStack gap={3}>
          <Button
            // onMouseDown={handleMouseDown}
            // onMouseUp={handleMouseUp}
            // onTouchStart={handleMouseDown}
            // onTouchEnd={handleMouseUp}
            // disabled={isTutorSpeaking || isPlaying}
            w="80px"
            h="80px"
            borderRadius="full"
            colorPalette={userIsSpeaking ? "red" : "blue"}
            transform={userIsSpeaking ? "scale(1.1)" : "scale(1)"}
            transition="all 0.2s"
            _disabled={{
              bg: "gray.300",
              cursor: "not-allowed",
            }}
          >
            <MicrophoneIcon />
          </Button>

          <Text color="fg.muted" fontSize="sm">
            {/* {isTutorSpeaking || isPlaying
                    ? "Tutor is speaking..."
                    : isRecording
                      ? "Listening... Release to send"
                      : "Hold to speak"} */}
          </Text>
          {/*       
                {recorderError && (
                  <Text color="red.500" fontSize="sm">
                    {recorderError}
                  </Text>
                )} */}
        </VStack>
      </Box>
    </Box>
  );
}
