import { Outlet } from "react-router";
import { Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import MainNavigation from "@/components/navigation-bar/MainNavigation";

export default function RootLayout() {
  return (
    <Flex direction="column" h="100vh" w="full">
      <MainNavigation />
      <Flex flex="1">
        <Outlet />
      </Flex>
      <Toaster />
    </Flex>
  );
}
