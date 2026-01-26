import { Flex, Box } from "@chakra-ui/react";
import { ConversationInterface } from "../components/ConversationInterface";
import MainNavigation from "../components/navigation-bar/MainNavigation";

export default function HomePage() {
  return (
    <Box minH="100vh" bg="bg">
      <MainNavigation />
      <ConversationInterface />
    </Box>
  );
}
