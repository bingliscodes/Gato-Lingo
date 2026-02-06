import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";

import { type StudentAssignmentResponse, getExamData } from "@/utils/apiCalls";
import ConversationInterface from "@/components/dashboard/student-dashboard/ConversationInterface";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ConversationInterfacePage() {
  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
  const [examInProgress, setExamInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    `ws://${import.meta.env.VITE_BACKEND_URL}/ws/conversation`,
  );

  const { sessionId } = useParams();

  useEffect(() => {
    const loadExamDataAsync = async () => {
      try {
        const data = await getExamData(sessionId);
        setExamData(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadExamDataAsync();
  }, [sessionId]);

  // Start conversation once data is loaded and Websocket is connected
  useEffect(() => {
    if (examData && connectionStatus === "connected" && !examInProgress) {
      sendMessage(JSON.stringify({ type: "config", ...examData }));
      setExamInProgress(true);
    }
  }, [examData, connectionStatus, examInProgress, sendMessage]);

  if (isLoading) return <div>Loading exam...</div>;
  if (error) return <div>Error: {error} </div>;

  if (connectionStatus === "connecting") {
    return <div>Connecting to tutor...</div>;
  }
  return (
    <ConversationInterface
      examData={examData}
      setExamInProgress={setExamInProgress}
      sendMessage={sendMessage}
      lastMessage={lastMessage}
      connectionStatus={connectionStatus}
    />
  );
}
