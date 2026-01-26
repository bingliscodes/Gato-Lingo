import { Flex, Box } from "@chakra-ui/react";
import { ConversationInterface } from "../components/ConversationInterface";

export default function HomePage() {
  return (
    <Box minH="100vh" bg="bg">
      <ConversationInterface />
    </Box>
  );
}
