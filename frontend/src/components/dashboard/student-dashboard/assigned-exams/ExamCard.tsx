import { useState, useCallback } from "react";
import { Button, Flex, Text, Card } from "@chakra-ui/react";
import { NavLink } from "react-router";
import VocabularyTable from "@/components/common/VocabularyTable";

import { useWebSocket } from "@/hooks/useWebSocket";
import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import ConversationInterface from "../ConversationInterface";
import StudentExamScoreCard from "./StudentExamScoreCard";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  const [examInProgress, setExamInProgress] = useState(false);

  return (
    <Flex flex="1" w="100vw" px={1}>
      {!examInProgress && (
        <Card.Root variant="elevated">
          <Flex direction="column" flex="1">
            <Card.Header textStyle="heading.lg">
              {examData.exam.title}
            </Card.Header>
            <Card.Body gap={1}>
              <Text>Topic: {examData.exam.topic}</Text>
              <Text>Description: {examData.exam.description}</Text>
              <Text>Tenses: {JSON.parse(examData.exam.tenses).join(", ")}</Text>
              <Text>Target Vocabulary</Text>
              <VocabularyTable
                vocabularyListData={examData.exam.vocabulary_list}
              />
              <Text>Status: {examData.status}</Text>
              <Text>Due Date: {examData.due_date}</Text>
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
