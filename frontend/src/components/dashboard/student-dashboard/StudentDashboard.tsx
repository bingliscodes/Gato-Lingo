import { Flex, Text } from "@chakra-ui/react";
import AssignedExams from "./assigned-exams/AssignedExams";

export default function StudentDashboard() {
  return (
    <Flex direction="column">
      <Text>Student dashboard</Text>
      <AssignedExams />
    </Flex>
  );
}
