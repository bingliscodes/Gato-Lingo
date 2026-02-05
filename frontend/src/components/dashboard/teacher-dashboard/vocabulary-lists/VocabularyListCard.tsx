import { Card, Flex, Text, Table } from "@chakra-ui/react";

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
        <Text my={2} textAlign="center" fontWeight="bold">
          Vocabulary
        </Text>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Word</Table.ColumnHeader>
              <Table.ColumnHeader>Translation</Table.ColumnHeader>
              <Table.ColumnHeader>Part of Speech</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          {vocabularyListData.items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.word}</Table.Cell>
              <Table.Cell>{item.translation}</Table.Cell>
              <Table.Cell>{item.part_of_speech}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Root>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card.Root>
  );
}
