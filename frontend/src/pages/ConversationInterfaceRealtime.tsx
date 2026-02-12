import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useRealtimeAPI } from "@/hooks/useRealtimeAPI";
import { type StudentAssignmentResponse, getExamData } from "@/utils/apiCalls";

export default function ConversationInterfaceRealtime() {
  const { sessionId } = useParams();

  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
  const [isLoadingExamData, setIsLoadingExamData] = useState(true);
  const [errorLoadingExamData, setErrorLoadingExamData] = useState<
    string | null
  >(null);

  // Always call the hook at the top level (React rules)
  const { isConnected, isLoading, error, connect, disconnect } =
    useRealtimeAPI();

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
    <div style={{ padding: 20 }}>
      <h1>Realtime API Test</h1>
      <p>Exam: {examData.exam.title}</p>

      <p>Status: {isConnected ? "Connected ✅" : "Disconnected ❌"}</p>
      {isLoading && <p>Connecting...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div style={{ marginTop: 20 }}>
        {!isConnected ? (
          <button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Start Conversation"}
          </button>
        ) : (
          <button onClick={disconnect}>End Conversation</button>
        )}
      </div>

      {isConnected && (
        <p style={{ marginTop: 20 }}>
          🎤 Speak into your microphone - the AI should respond!
        </p>
      )}
    </div>
  );
}
