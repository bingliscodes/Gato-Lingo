import CreateExam from "@/components/dashboard/CreateExam";
import { Flex } from "@chakra-ui/react";

export default function DashboardPage() {
  return (
    <Flex direction="column">
      <h1>Dashboard</h1>
      <CreateExam />
    </Flex>
  );
}
