import { useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import ConversationInterface from "../ConversationInterface";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  const [examInProgress, setExamInProgress] = useState(false);

  return (
    <Flex flex="1" w="100vw" px={1}>
      {!examInProgress && (
        <Flex direction="column" flex="1">
          <Text fontSize="xl">{examData.exam.title}</Text>
          <Text>Topic: {examData.exam.topic}</Text>
          <Text>Description: {examData.exam.description}</Text>
          <Text>Tenses: {examData.exam.tenses}</Text>
          <Text>Vocab: {examData.exam.vocabulary_list_manual}</Text>
          <Text>Status: {examData.status}</Text>
          <Text>Due Date: {examData.due_date} </Text>
          {/* <NavLink to="/dashboard/exam">
        {examData.status != "in_progress" && "Start Exam"}
      </NavLink> */}
          {/* For now let's use a toggle instead of a separate route */}
          <Button onClick={(): void => setExamInProgress(true)}>
            Start exam
          </Button>
        </Flex>
      )}

      {examInProgress && <ConversationInterface examData={examData} />}
    </Flex>
  );
}
