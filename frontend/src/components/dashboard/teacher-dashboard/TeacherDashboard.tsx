import { Button, Flex, HStack, Heading } from "@chakra-ui/react";
import { NavLink } from "react-router";

import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1" mt={2} gap={3} px={1} align="center">
      <Heading textStyle="heading.xl" textAlign="center">
        Welcome to your Dashboard
      </Heading>
      <HStack>
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
