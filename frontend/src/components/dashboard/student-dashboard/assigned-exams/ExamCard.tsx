import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import { Flex, Text, Button } from "@chakra-ui/react";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  const handleStart = () => {
    examData.exam;
  };

  return (
    <Flex direction="column" flex="1">
      <Text fontSize="xl">{examData.exam.title}</Text>
      <Text>Topic: {examData.exam.topic}</Text>
      <Text>Tenses: {examData.exam.tenses}</Text>
      <Text>Vocab: {examData.exam.vocabulary_list_manual}</Text>
      <Text>Status: {examData.status}</Text>
      <Text>Due Date: {examData.due_date} </Text>
      <Button onClick={handleStart}>
        {examData.status != "in_progress" && "Start Exam"}
      </Button>
    </Flex>
  );
}
