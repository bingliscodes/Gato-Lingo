import { Table } from "@chakra-ui/react";

import { type VocabularyListResponse } from "@/utils/apiCalls";
interface VocabularyTableProps {
  vocabularyListData: VocabularyListResponse | null;
}
export default function VocabularyTable({
  vocabularyListData,
}: VocabularyTableProps) {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Word</Table.ColumnHeader>
          <Table.ColumnHeader>Translation</Table.ColumnHeader>
          <Table.ColumnHeader>Part of Speech</Table.ColumnHeader>
          <Table.ColumnHeader>Example Sentence</Table.ColumnHeader>
          <Table.ColumnHeader>Regional Notes</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {vocabularyListData?.items.map((item) => (
          <Table.Row key={item?.id}>
            <Table.Cell>{item.word}</Table.Cell>
            <Table.Cell>{item.translation}</Table.Cell>
            <Table.Cell>{item.part_of_speech}</Table.Cell>
            <Table.Cell>{item.example_sentence}</Table.Cell>
            <Table.Cell>{item.regional_notes}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
