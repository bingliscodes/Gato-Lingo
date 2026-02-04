import CreatedVocabularyLists from "@/components/dashboard/teacher-dashboard/CreatedVocabularyLists";
import VocabularyUpload from "@/components/dashboard/teacher-dashboard/VocabularyUpload";
import { Flex } from "@chakra-ui/react";

export default function VocabularyListsPage() {
  return (
    <Flex direction="column" flex="1">
      <CreatedVocabularyLists />
      <VocabularyUpload />
    </Flex>
  );
}
