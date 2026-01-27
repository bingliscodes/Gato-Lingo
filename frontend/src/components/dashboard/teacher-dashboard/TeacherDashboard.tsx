import { Flex, Text } from "@chakra-ui/react";
import CreateExam from "./CreateExam";

export default function TeacherDashboard() {
  return (
    <Flex direction="column">
      <Text>Teacher dashboard</Text>
      <CreateExam />
    </Flex>
  );
}
