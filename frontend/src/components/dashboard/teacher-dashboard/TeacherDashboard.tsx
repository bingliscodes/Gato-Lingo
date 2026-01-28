import { Flex, Text } from "@chakra-ui/react";
import CreateExam from "./CreateExam";
import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1">
      <Text>Teacher dashboard</Text>
      <CreateExam />
      <CreatedExams />
    </Flex>
  );
}
