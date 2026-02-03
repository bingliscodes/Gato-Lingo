import { Flex, HStack, Separator, Text, VStack, Card } from "@chakra-ui/react";
import { type ExamScoreSummary } from "@/utils/apiCalls";

interface ExamScoreCardProps {
  examScoreData: ExamScoreSummary;
}

export default function TeacherExamScoreCard({
  examScoreData,
}: ExamScoreCardProps) {
  console.log(examScoreData);
  return (
    <Card.Root>
      <VStack>
        <Text fontSize="2xl" fontWeight="bold">
          Student
        </Text>
        <Text>{examScoreData.student_name}</Text>
        <Flex gap={4}>
          <VStack>
            <Text fontWeight="bold">Vocabulary Usage Score</Text>
            <Text>{examScoreData.score?.vocabulary_usage_score * 100}</Text>
          </VStack>
          <Separator orientation="vertical" variant="solid" size="md" />
          <VStack>
            <Text fontWeight="bold">Fluency Score</Text>
            <Text>{examScoreData.score?.fluency_score * 100}</Text>
          </VStack>
          <Separator orientation="vertical" variant="solid" size="md" />
          <VStack>
            <Text fontWeight="bold">Verb Tense Accuracy Score</Text>
            <Text> {examScoreData.score?.verb_tense_accuracy_score * 100}</Text>
          </VStack>
          <Separator orientation="vertical" variant="solid" size="md" />
          <VStack>
            <Text fontWeight="bold">Overall Score</Text>
            <Text>{examScoreData.score?.overall_score * 100}</Text>
          </VStack>
        </Flex>
        <HStack fontSize="sm">
          <Text fontWeight="bold">Exam Feedback:</Text>
          <Text>{examScoreData.score?.grammar_feedback}</Text>
        </HStack>
        <HStack fontSize="sm">
          <Text fontWeight="bold">Missed vocabulary items:</Text>
          <Text>{examScoreData.score?.vocabulary_missed}</Text>
        </HStack>
      </VStack>
    </Card.Root>
  );
}
