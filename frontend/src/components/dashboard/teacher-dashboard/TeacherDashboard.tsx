import { Button, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import CreatedExams from "./CreatedExams";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1" gap={1} px={1}>
      <Text>Teacher dashboard</Text>
      <CreatedExams />

      <NavLink to="createExam">
        <Button variant="outline">Create new exam</Button>
      </NavLink>
    </Flex>
  );
}
