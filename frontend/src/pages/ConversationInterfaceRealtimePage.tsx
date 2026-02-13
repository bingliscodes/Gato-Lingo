import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Box, Text, Button } from "@chakra-ui/react";

import { useRealtimeAPI } from "@/hooks/useRealtimeAPI";
import { type StudentAssignmentResponse, getExamData } from "@/utils/apiCalls";
import { MessageList } from "@/components/MessageList";

export default function ConversationInterfaceRealtimePage() {
  const { sessionId } = useParams();

  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
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

        {!isConnected && (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Start Conversation"}
          </Button>
        )}
        <Button bgColor="red.300" variant="solid" onClick={disconnect}>
          End Session
        </Button>
        {isConnected && (
          <p style={{ marginTop: 20 }}>
            🎤 Speak into your microphone - the AI should respond!
          </p>
        )}
        {isConnected && (
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
      </Box>
      <MessageList messages={conversationHistory} isListening={false} />
    </Box>
  );
}
