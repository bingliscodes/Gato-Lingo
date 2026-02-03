import { useState, useCallback } from "react";
import { Button, Flex, HStack, Text, Card } from "@chakra-ui/react";
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
            <Card.Body>
              <HStack>
                <Text>Topic:</Text>
                <Text fontSize="sm"> {examData.exam.topic}</Text>
              </HStack>
              <HStack>
                <Text>Description:</Text>
                <Text fontSize="sm">{examData.exam.description}</Text>
              </HStack>
              <HStack>
                <Text>Tenses:</Text>
                <Text fontSize="sm">{examData.exam.tenses}</Text>
              </HStack>
              <HStack>
                <Text>Vocabulary:</Text>
                <Text fontSize="sm">
                  {examData.exam.vocabulary_list_manual}
                </Text>
              </HStack>
              <HStack>
                <Text>Status:</Text>
                <Text>{examData.status}</Text>
              </HStack>
              <HStack>
                <Text>Due Date:</Text>
                <Text fontSize="sm">{examData.due_date}</Text>
              </HStack>
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
