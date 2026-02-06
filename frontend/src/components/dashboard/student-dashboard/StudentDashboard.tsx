import { Flex, Heading } from "@chakra-ui/react";
import AssignedExams from "./assigned-exams/AssignedExams";

export default function StudentDashboard() {
  return (
    <Flex direction="column" align="center">
      <Heading mt={2} textStyle="heading.xl">
        Welcome to your Dashboard
      </Heading>
      <AssignedExams />
    </Flex>
  );
}
