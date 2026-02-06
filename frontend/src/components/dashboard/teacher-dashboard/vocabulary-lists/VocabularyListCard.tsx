import { Card, Text } from "@chakra-ui/react";

import { type VocabularyListResponse } from "@/utils/apiCalls";
import VocabularyTable from "@/components/common/VocabularyTable";

interface VocabularyListCardProps {
  vocabularyListData: VocabularyListResponse | null;
}

export default function VocabularyListCard({
  vocabularyListData,
}: VocabularyListCardProps) {
  return (
    <Card.Root
      bg="bg"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      shadow="sm"
    >
      <Card.Header textStyle="heading.lg">
        {vocabularyListData?.title}
      </Card.Header>
      <Card.Body>
        <Text fontWeight="bold">Description:</Text>
        <Text>{vocabularyListData?.description}</Text>
        <Text my={2} fontWeight="bold">
          Vocabulary
        </Text>
        <VocabularyTable vocabularyListData={vocabularyListData} />
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card.Root>
  );
}
