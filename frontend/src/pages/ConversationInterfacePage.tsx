import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";

import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import ConversationInterface from "@/components/dashboard/student-dashboard/ConversationInterface";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ConversationInterfacePage() {
  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    `ws://${import.meta.env.VITE_BACKEND_URL}/ws/conversation`,
  );

  const { examId } = useParams();

  useEffect(() => {
    const loadExamDataAsync = async () => {
      try {
        const data = await getExamData(examId);
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
  }, []);

  const handleStartConversation = useCallback(
    (examData: StudentAssignmentResponse) => {
      sendMessage(
        JSON.stringify({
          type: "config",
          ...examData,
        }),
      );
      setExamInProgress(true);
    },
    [sendMessage],
  );
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
