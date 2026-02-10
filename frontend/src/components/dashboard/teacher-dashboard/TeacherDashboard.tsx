import { Button, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck } from "react-icons/lu";
import { NavLink } from "react-router";
import { useUser } from "@/contexts/UserContext";

export default function TeacherDashboard() {
  const { userData } = useUser();
  return (
    <Flex direction="column" align="center" flex="1">
      <Heading textStyle="heading.xl" mt={2} textAlign="center">
        Welcome to your Dashboard, {userData?.first_name}
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
