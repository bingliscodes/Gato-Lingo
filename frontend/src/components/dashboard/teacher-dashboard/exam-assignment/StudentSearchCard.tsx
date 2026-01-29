import { Flex, Text } from "@chakra-ui/react";
import type { StudentResponse } from "@/utils/apiCalls";

export interface StudentCardProps {
  studentData: StudentResponse;
}

export default function StudentCard({ studentData }: StudentCardProps) {
  return (
    <Flex>
      <Text>
        {studentData.first_name} {studentData.last_name}
      </Text>
    </Flex>
  );
}
