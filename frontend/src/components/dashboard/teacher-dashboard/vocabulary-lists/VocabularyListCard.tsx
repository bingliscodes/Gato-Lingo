import { Card, Flex, Text } from "@chakra-ui/react";

import { type VocabularyListResponse } from "@/utils/apiCalls";

interface VocabularyListCardProps {
  vocabularyListData: VocabularyListResponse;
}

export default function VocabularyListCard({
  vocabularyListData,
}: VocabularyListCardProps) {
  return (
    <Card.Root>
      <Card.Header fontSize="lg" fontWeight="bold">
        {vocabularyListData.title}
      </Card.Header>
      <Card.Body gap={1}>
        <Text>Description: {vocabularyListData.description}</Text>
      </Card.Body>
    </Card.Root>
  );
}

<Card.Root w="60%">
  <Card.Header fontSize="lg" fontWeight="bold">
    {examData.exam.title}
  </Card.Header>
  <Card.Body gap={1}>
    <Text>Topic: {examData.exam.topic}</Text>
    <Text>Description: {examData.exam.description}</Text>
    <Text>Tenses: {examData.exam.tenses}</Text>
    <Text>Vocabulary: {examData.exam.vocabulary_list_manual}</Text>
    <Text>
      Status: {examData.completed}/{examData.total_assigned} completed,{" "}
      {examData.in_progress} in progress, {examData.pending} pending
    </Text>
  </Card.Body>
  <Card.Footer>
    <AssignToStudentButton examId={examData.exam.id} />
    <NavLink to={`scores/${examData.exam.id}`}>
      <Button variant="outline" size="sm">
        Scores
      </Button>
    </NavLink>
  </Card.Footer>
</Card.Root>;
