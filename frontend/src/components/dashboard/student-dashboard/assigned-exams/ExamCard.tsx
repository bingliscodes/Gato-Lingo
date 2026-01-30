import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import { Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  return (
    <Flex direction="column" flex="1">
      <Text fontSize="xl">{examData.exam.title}</Text>
      <Text>Topic: {examData.exam.topic}</Text>
      <Text>Description: {examData.exam.description}</Text>
      <Text>Tenses: {examData.exam.tenses}</Text>
      <Text>Vocab: {examData.exam.vocabulary_list_manual}</Text>
      <Text>Status: {examData.status}</Text>
      <Text>Due Date: {examData.due_date} </Text>
      <NavLink to="/dashboard/exam">
        {examData.status != "in_progress" && "Start Exam"}
      </NavLink>
    </Flex>
  );
}
