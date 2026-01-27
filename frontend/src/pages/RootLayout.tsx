import { Outlet } from "react-router";
import { Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout() {
  return (
    <Flex direction="column" h="100vh" w="full">
      <Flex flex="1">
        <Outlet />
      </Flex>
      <Toaster />
    </Flex>
  );
}
