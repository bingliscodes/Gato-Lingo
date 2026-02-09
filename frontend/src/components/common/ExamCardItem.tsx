import { HStack, Text } from "@chakra-ui/react";

interface ExamCardProps {
  title: string;
  data: string | null;
}

export default function ExamCardItem({ title, data }: ExamCardProps) {
  return (
    <HStack>
      <Text textStyle="heading.md">{title}:</Text>
      <Text textStyle="body.lg">{data}</Text>
    </HStack>
  );
}
