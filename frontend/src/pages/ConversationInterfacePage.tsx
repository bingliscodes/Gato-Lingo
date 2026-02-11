//ConversationInterfacePage.tsx
import { useState, useEffect } from "react";
import { useParams, useBlocker } from "react-router";

import { type StudentAssignmentResponse, getExamData } from "@/utils/apiCalls";
import ConversationInterface from "@/components/dashboard/student-dashboard/ConversationInterface";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ConversationInterfacePage() {
  const { sessionId } = useParams();

  // Data loading state
  const [examData, setExamData] = useState<StudentAssignmentResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session State
  const [configSent, setConfigSent] = useState(false);

  // WebSocket
  const {
    sendMessage,
    messages: wsMessages,
    clearMessages,
    connectionStatus,
  } = useWebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/ws/conversation`);

  // Navigation blocker

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      configSent && currentLocation.pathname !== nextLocation.pathname,
  );

  // 1. Load exam data on mount
  useEffect(() => {
    async function loadExamDataAsync() {
      try {
        const data = await getExamData(sessionId);
        setExamData(data);
      } catch (err) {
        if (err) {
          setError(err instanceof Error ? err.message : "Failed to load exam");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadExamDataAsync();
  }, [sessionId]);

  // 2. Send config when ready (or on reconnect)
  useEffect(() => {
    if (examData && connectionStatus === "connected" && !configSent) {
      sendMessage(JSON.stringify({ type: "config", ...examData }));
      setConfigSent(true);
    }
  }, [examData, connectionStatus, configSent, sendMessage]);

  // 3. Reset config flag on disconnect so it resends
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      setConfigSent(false);
    }
  }, [connectionStatus]);

  // 4. Warn on page refresh/close
  useEffect(() => {
    if (!configSent) return;

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
  }, [configSent]);

  // 5. Handle React Router navigation blocking
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "You have an exam in progress. Are you sure you want to leave? Your progress may be lost",
      );

      if (confirmLeave) {
        sendMessage(JSON.stringify({ type: "end_session" }));
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, sendMessage]);

  // Render loading/error states

  if (isLoading) return <div>Loading exam...</div>;
  if (error) return <div>Error: {error} </div>;
  if (connectionStatus === "connecting") {
    return <div>Connecting to tutor...</div>;
  }
  if (!examData) return <div> No exam data found </div>;

  return (
    <ConversationInterface
      sendMessage={sendMessage}
      wsMessages={wsMessages}
      clearMessages={clearMessages}
      connectionStatus={connectionStatus}
      onEndSession={() => {
        sendMessage(JSON.stringify({ type: "end_session" }));
      }}
    />
  );
}
