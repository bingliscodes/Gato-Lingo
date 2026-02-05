import CreatedExams from "@/components/dashboard/teacher-dashboard/CreatedExams";
import { Button } from "@chakra-ui/react";
import { NavLink } from "react-router";
import { Flex } from "@chakra-ui/react";

export default function ExamsPage() {
  return (
    <Flex direction="column" flex="1" align="center" gap={2}>
      <CreatedExams />
      <NavLink to="createExam">
        <Button variant="solid" size="lg">
          Create new exam
        </Button>
      </NavLink>
    </Flex>
  );
}
