import { Flex, Card, Text, Button } from "@chakra-ui/react";
import { NavLink } from "react-router";

import AssignToStudentButton from "./exam-assignment/AssignToStudentButton";
import type { DashboardExamResponse } from "@/utils/apiCalls";

interface CreatedExamCardProps {
  examData: DashboardExamResponse;
}

export default function CreatedExamCard({ examData }: CreatedExamCardProps) {
  return (
    <Card.Root w="60%">
      <Card.Header fontSize="lg" fontWeight="bold">
        {examData.exam.title}
      </Card.Header>
      <Card.Body gap={1}>
        <Text>Topic: {examData.exam.topic}</Text>
        <Text>Description: {examData.exam.description}</Text>
        <Text>Tenses: {examData.exam.tenses}</Text>
        <Text>Vocabulary List: {examData.vocabulary_list?.title}</Text>
        <Text>
          Status: {examData.completed}/{examData.total_assigned} completed,
          {examData.in_progress} in progress, {examData.pending} pending
        </Text>
      </Card.Body>
      <Card.Footer>
        <AssignToStudentButton examId={examData.exam.id} />
        <NavLink to={`scores/${examData.exam.id}`}>
          <Button variant="solid" size="sm">
            Scores
          </Button>
        </NavLink>
      </Card.Footer>
    </Card.Root>
  );
}
