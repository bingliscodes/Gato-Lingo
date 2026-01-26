import { Outlet } from "react-router";
import { Flex } from "@chakra-ui/react";

export default function RootLayout() {
  return (
    <Flex direction="column" h="100vh" w="full">
      <Flex flex="1">
        <Outlet />
      </Flex>
    </Flex>
  );
}
