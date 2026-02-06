import CreatedExams from "@/components/dashboard/teacher-dashboard/CreatedExams";
import { Button, Flex } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";

export default function ExamsPage() {
  return (
    <Flex direction="column" flex="1" align="center" gap={2}>
      <CreatedExams />
      <NavLink to="createExam">
        <Button variant="solid" size="lg">
          Create new exam
        </Button>
      </NavLink>
      <Outlet />
    </Flex>
  );
}
