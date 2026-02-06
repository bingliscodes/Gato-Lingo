import { useState, useEffect } from "react";
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

  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     examInProgress && currentLocation.pathname !== nextLocation.pathname,
  // );

  // 1. Load exam data on mount
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

  // 2. Start conversation when data loaded AND WebSocket is connected
  useEffect(() => {
    if (examData && connectionStatus === "connected" && !examInProgress) {
      sendMessage(JSON.stringify({ type: "config", ...examData }));
      setExamInProgress(true);
    }
  }, [examData, connectionStatus, examInProgress, sendMessage]);

  // 3. Handle reconnection - resend config if d/c then reconnected
  useEffect(() => {
    if (examData && connectionStatus === "connected" && examInProgress) {
      // Already in progress, this is a reconnection
      console.log("Reconnected, resending config...");
      sendMessage(JSON.stringify({ type: "config", ...examData }));
    }
  }, [connectionStatus]);

  // 4. Warn on page refresh/close
  useEffect(() => {
    if (!examInProgress) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You have an exam in progress. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [examInProgress]);

  // 5. Handle React Router navigation blocking
  // useEffect(() => {
  //   if (blocker.state === "blocked") {
  //     const confirmLeave = window.confirm(
  //       "You have an exam in progress. Are you sure you want to leave? Your progress may be lost",
  //     );

  //     if (confirmLeave) {
  //       sendMessage(JSON.stringify({ type: "end_session" }));
  //       blocker.proceed();
  //     } else {
  //       blocker.reset();
  //     }
  //   }
  // }, [blocker, sendMessage]);

  if (isLoading) return <div>Loading exam...</div>;
  if (error) return <div>Error: {error} </div>;
  if (connectionStatus === "connecting") {
    return <div>Connecting to tutor...</div>;
  }

  return (
    <ConversationInterface
      setExamInProgress={setExamInProgress}
      sendMessage={sendMessage}
      lastMessage={lastMessage}
      connectionStatus={connectionStatus}
    />
  );
}
