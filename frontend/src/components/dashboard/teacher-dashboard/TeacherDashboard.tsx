import { Button, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1" gap={2} px={1}>
      <Text fontWeight="bolder" fontSize="3xl" textAlign="center">
        Welcome to your Dashboard
      </Text>
      <CreatedExams />

      <NavLink to="createExam">
        <Button variant="outline" size="2xl">
          Create new exam
        </Button>
      </NavLink>
    </Flex>
  );
}
