import { useVocabularyLists } from "@/hooks/useVocabularyLists";
import { Flex, Text } from "@chakra-ui/react";

export default function CreatedVocabularyLists() {
  const { vocabLists, isLoading, error } = useVocabularyLists();

  if (isLoading) return <div>Loading vocabulary lists... </div>;
  if (error) return <div>An error has occurred: {error} </div>;
  console.log(vocabLists);
  return (
    <Flex gap={2} mx={1} flex="1" justify="center">
      <Text fontWeight="bolder" fontSize="3xl">
        Vocabulary Lists
      </Text>
    </Flex>
  );
}
