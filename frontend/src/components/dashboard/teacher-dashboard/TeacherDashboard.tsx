import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1" gap={2} px={1} align="center">
      <Text fontWeight="bolder" fontSize="3xl" textAlign="center">
        Welcome to your Dashboard
      </Text>
      <HStack>
        <NavLink to="createExam">
          <Button variant="solid" size="lg">
            Create new exam
          </Button>
        </NavLink>
        <NavLink to="exams">
          <Button variant="solid" size="lg">
            Manage Exams
          </Button>
        </NavLink>
        <NavLink to="vocabulary">
          <Button variant="solid" size="lg">
            Manage Vocabulary Lists
          </Button>
        </NavLink>
      </HStack>
    </Flex>
  );
}
