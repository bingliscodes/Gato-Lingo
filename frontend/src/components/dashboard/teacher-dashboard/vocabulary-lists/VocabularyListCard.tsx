import { Card, Separator } from "@chakra-ui/react";

import { type VocabularyListResponse } from "@/utils/apiCalls";
import VocabularyTable from "@/components/common/VocabularyTable";
import ExamCardItem from "@/components/common/ExamCardItem";

interface VocabularyListCardProps {
  vocabularyListData: VocabularyListResponse;
}

export default function VocabularyListCard({
  vocabularyListData,
}: VocabularyListCardProps) {
  return (
    <Card.Root variant="elevated">
      <Card.Header>{vocabularyListData.title}</Card.Header>
      <Card.Body>
        <ExamCardItem
          title="Description"
          data={vocabularyListData.description}
        />
        <Separator my={2} size="md" />
        <VocabularyTable vocabularyListData={vocabularyListData} />
      </Card.Body>
    </Card.Root>
  );
}
