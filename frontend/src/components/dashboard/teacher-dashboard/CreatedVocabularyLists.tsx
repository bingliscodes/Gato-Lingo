import { useVocabularyLists } from "@/hooks/useVocabularyLists";
import { Flex, Text } from "@chakra-ui/react";

export default function CreatedVocabularyLists() {
  const { vocabLists, isLoading, error } = useVocabularyLists();

  if (isLoading) return <div>Loading vocabulary lists... </div>;
  if (error) return <div>An error has occurred: {error} </div>;
  return (
    <Flex>
      <Text>Vocabulary Lists</Text>
    </Flex>
  );
}
