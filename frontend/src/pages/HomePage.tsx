import { Flex } from "@chakra-ui/react";
import { ConversationInterface } from "../components/ConversationInterface";
import MainNavigation from "../components/navigation-bar/MainNavigation";

export default function HomePage() {
  return (
    <Flex direction="column" flex="1" w="full">
      <MainNavigation />
      <ConversationInterface />
    </Flex>
  );
}
