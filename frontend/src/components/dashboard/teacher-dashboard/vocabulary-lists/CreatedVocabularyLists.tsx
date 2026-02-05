import { Flex, Text, Carousel, IconButton, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useVocabularyLists } from "@/hooks/useVocabularyLists";
import VocabularyListCard from "./VocabularyListCard";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function CreatedVocabularyLists() {
  const { vocabLists, isLoading, error } = useVocabularyLists();
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  let vocabularyListsFiltered = [...vocabLists];

  vocabularyListsFiltered = vocabLists.filter(
    (list) =>
      list.description?.toLowerCase().includes(search) ||
      list.title.toLowerCase().includes(search),
  );

  if (isLoading) return <div>Loading vocabulary lists... </div>;
  if (error) return <div>An error has occurred: {error} </div>;

  return (
    <Flex gap={2} mx={1} justify="center">
      <Flex flexDir="column" gap={3}>
        <Text mb={2} textAlign="center" fontWeight="bolder" fontSize="3xl">
          Vocabulary Lists
        </Text>

        <Carousel.Root
          slideCount={vocabLists.length}
          mx="auto"
          maxW="2xl"
          page={page}
          onPageChange={(e) => setPage(e.page)}
        >
          {vocabularyListsFiltered && (
            <Carousel.ItemGroup>
              {vocabularyListsFiltered?.map((list, idx) => (
                <Carousel.Item key={list.id} index={idx}>
                  <VocabularyListCard vocabularyListData={list} />
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
          )}
          {vocabularyListsFiltered.length == 0 && (
            <div>
              No vocabulary list found. Please try different search terms.
            </div>
          )}

          <Carousel.Control justifyContent="center" gap="4">
            <Carousel.PrevTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <LuChevronLeft />
              </IconButton>
            </Carousel.PrevTrigger>
            <Carousel.Indicators />

            <Carousel.NextTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <LuChevronRight />
              </IconButton>
            </Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>
        <Input
          placeholder="Search for keywords in title or description"
          onChange={(e) => setSearch(e.target.value)}
        />
      </Flex>
    </Flex>
  );
}
