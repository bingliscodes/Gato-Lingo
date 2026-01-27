import { Flex } from "@chakra-ui/react";
import { ConversationInterface } from "../components/ConversationInterface";

export default function HomePage() {
  return (
    <Flex direction="column" flex="1" w="full">
      <ConversationInterface />
    </Flex>
  );
}
