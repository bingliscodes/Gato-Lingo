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
      <Card.Body>
        <Text fontWeight="bold">Description:</Text>
        <Text>{vocabularyListData.description}</Text>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card.Root>
  );
}
