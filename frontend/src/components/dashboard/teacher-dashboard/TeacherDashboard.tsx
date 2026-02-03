import { Flex, Text } from "@chakra-ui/react";
import CreatedExams from "./CreatedExams";
import { NavLink } from "react-router";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" flex="1">
      <Text>Teacher dashboard</Text>
      <CreatedExams />

      <NavLink to="createExam">Create new exam</NavLink>
    </Flex>
  );
}
