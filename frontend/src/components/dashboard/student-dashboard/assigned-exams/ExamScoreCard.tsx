import { Flex, Separator, Text, VStack } from "@chakra-ui/react";
import { type SessionScoreResponse } from "@/utils/apiCalls";

interface ExamScoreCardProps {
  examScoreData: SessionScoreResponse;
}

export default function ExamScoreCard({ examScoreData }: ExamScoreCardProps) {
  return (
    <VStack>
      <Text fontSize="2xl" fontWeight="bold">
        Exam Score
      </Text>
      <Flex gap={4}>
        <VStack>
          <Text fontWeight="bold">Vocabulary Usage Score</Text>
          <Text>{examScoreData.vocabulary_usage_score * 100}</Text>
        </VStack>
        <Separator orientation="vertical" variant="solid" size="md" />
        <VStack>
          <Text fontWeight="bold">Fluency Score</Text>
          <Text>{examScoreData.fluency_score * 100}</Text>
        </VStack>
        <Separator orientation="vertical" variant="solid" size="md" />
        <VStack>
          <Text fontWeight="bold">Verb Tense Accuracy Score</Text>
          <Text> {examScoreData.verb_tense_accuracy_score * 100}</Text>
        </VStack>
        <Separator orientation="vertical" variant="solid" size="md" />
        <VStack>
          <Text fontWeight="bold">Overall Score</Text>
          <Text>{examScoreData.overall_score * 100}</Text>
        </VStack>
      </Flex>
    </VStack>
  );
}
