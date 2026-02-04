import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1" gap={2} px={1}>
      <Text fontWeight="bolder" fontSize="3xl" textAlign="center">
        Welcome to your Dashboard
      </Text>
      <CreatedExams />
      <HStack>
        <NavLink to="createExam">
          <Button variant="outline" size="xl">
            Create new exam
          </Button>
        </NavLink>
        <NavLink to="uploadVocabulary">
          <Button variant="outline" size="xl">
            Upload vocabulary list
          </Button>
        </NavLink>
      </HStack>
    </Flex>
  );
}
