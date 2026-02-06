import { Button, Flex, Heading } from "@chakra-ui/react";
import { NavLink } from "react-router";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" align="center" flex="1" mt={2} gap={3} px={1}>
      <Heading textStyle="heading.xl" textAlign="center">
        Welcome to your Dashboard
      </Heading>
      <Flex flexDir="column" gap={2}>
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
      </Flex>
    </Flex>
  );
}
