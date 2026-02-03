import { Flex, Card, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import AssignToStudentButton from "./exam-assignment/AssignToStudentButton";
import type { DashboardExamResponse } from "@/utils/apiCalls";

interface CreatedExamCardProps {
  examData: DashboardExamResponse;
}

export default function CreatedExamCard({ examData }: CreatedExamCardProps) {
  return (
    <Card.Root>
      <Card.Header fontSize="lg" fontWeight="bold">
        {examData.exam.title}
      </Card.Header>
      <Card.Body>
        <Text>Topic: {examData.exam.topic}</Text>
        <Text>
          Status: {examData.completed}/{examData.total_assigned} completed,
          {examData.in_progress} in progress,
          {examData.pending} pending
        </Text>
        <Text>Topic: {examData.exam.topic}</Text>
        <Text> </Text>
        <Text>Description: {examData.exam.description}</Text>
        <Text>Tenses: {examData.exam.tenses}</Text>
        <Text>Vocabulary: {examData.exam.vocabulary_list_manual}</Text>
      </Card.Body>
      <Card.Footer>
        <AssignToStudentButton examId={examData.exam.id} />
        <NavLink to={`scores/${examData.exam.id}`}>Scores</NavLink>
      </Card.Footer>
    </Card.Root>
  );
}
