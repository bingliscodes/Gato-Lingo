import { Flex, Heading, Button } from "@chakra-ui/react";
import { NavLink } from "react-router";

export default function StudentDashboard() {
  return (
    <Flex direction="column" align="center" flex="1" gap={2}>
      <Heading mt={2} textStyle="heading.xl">
        Welcome to your Dashboard
      </Heading>
      <NavLink to="exams/assigned">
        <Button>Assigned Exams</Button>
      </NavLink>
      <NavLink to="exams/completed">
        <Button>Completed Exams</Button>
      </NavLink>
    </Flex>
  );
}
