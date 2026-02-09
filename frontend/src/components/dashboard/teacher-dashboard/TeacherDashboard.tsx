import { Button, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck } from "react-icons/lu";
import { NavLink } from "react-router";

export default function TeacherDashboard() {
  return (
    <Flex direction="column" align="center" flex="1" gap={2}>
      <Heading textStyle="heading.xl" mt={2} textAlign="center">
        Welcome to your Dashboard
      </Heading>
      <SimpleGrid mt={8} rowGap={3}>
        <NavLink to="exams">
          <Button w="full" fontSize="lg">
            <LuFolder /> Exams
          </Button>
        </NavLink>
        <NavLink to="vocabulary">
          <Button w="full" fontSize="lg">
            <LuSquareCheck />
            Vocabulary
          </Button>
        </NavLink>
      </SimpleGrid>
    </Flex>
  );
}
