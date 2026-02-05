import CreatedVocabularyLists from "@/components/dashboard/teacher-dashboard/vocabulary-lists/CreatedVocabularyLists";
import VocabularyUpload from "@/components/dashboard/teacher-dashboard/vocabulary-lists/VocabularyUpload";
import { Flex } from "@chakra-ui/react";

export default function VocabularyListsPage() {
  return (
    <Flex direction="column" flex="1" align="center" gap={2}>
      <CreatedVocabularyLists />
      <VocabularyUpload />
    </Flex>
  );
}
