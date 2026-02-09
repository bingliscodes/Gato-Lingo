import { Flex, Heading, Button, SimpleGrid } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck } from "react-icons/lu";
import { NavLink } from "react-router";

export default function StudentDashboard() {
  return (
    <Flex direction="column" align="center" flex="1">
      <Heading mt={2} textStyle="heading.xl">
        Welcome to your Dashboard
      </Heading>
      <SimpleGrid mt={8} rowGap={3}>
        <NavLink to="exams/assigned">
          <Button w="full" fontSize="lg">
            <LuFolder />
            Assigned Exams
          </Button>
        </NavLink>
        <NavLink to="exams/completed">
          <Button w="full" fontSize="lg">
            <LuSquareCheck />
            Completed Exams
          </Button>
        </NavLink>
      </SimpleGrid>
    </Flex>
  );
}
