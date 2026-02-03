import { useState, useCallback } from "react";
import { Button, Flex, Text, Card } from "@chakra-ui/react";
import { NavLink } from "react-router";

import { useWebSocket } from "@/hooks/useWebSocket";
import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import ConversationInterface from "../ConversationInterface";
import StudentExamScoreCard from "./StudentExamScoreCard";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  const [examInProgress, setExamInProgress] = useState(false);
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    //TODO: Make this use an env variable
    "ws://localhost:8000/ws/conversation",
  );

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
    <Flex flex="1" w="100vw" px={1}>
      {!examInProgress && (
        <Card.Root variant="elevated">
          <Flex direction="column" flex="1">
            <Card.Header fontSize="2xl" fontWeight="bold">
              {examData.exam.title}
            </Card.Header>
            <Card.Body gap={1}>
              <Text>Topic: {examData.exam.topic}</Text>
              <Text>Description: {examData.exam.description}</Text>
              <Text>Tenses: {examData.exam.tenses}</Text>
              <Text>Vocabulary: {examData.exam.vocabulary_list_manual}</Text>
              <Text>Status: {examData.status}</Text>
              <Text>Due Date:</Text>
              {/* <NavLink to="/dashboard/exam">
        {examData.status != "in_progress" && "Start Exam"}
      </NavLink> */}
              {/* For now let's use a toggle instead of a separate route */}
              {examData.session_score && (
                <StudentExamScoreCard examScoreData={examData.session_score} />
              )}
              {!examData.session_score && (
                <Button onClick={(): void => handleStartConversation(examData)}>
                  Start exam
                </Button>
              )}
            </Card.Body>
          </Flex>
        </Card.Root>
      )}

      {examInProgress && (
        <ConversationInterface
          examData={examData}
          setExamInProgress={setExamInProgress}
          sendMessage={sendMessage}
          lastMessage={lastMessage}
          connectionStatus={connectionStatus}
        />
      )}
    </Flex>
  );
}
