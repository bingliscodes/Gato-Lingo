"use client";

import { HStack, Box } from "@chakra-ui/react";

import RightNavContent from "./RightNavContent.tsx";
import LeftNavContent from "./LeftNavContent.tsx";

export default function MainNavigation() {
  return (
    <Box
      bg="bg.nav"
      position="sticky"
      borderBottom="solid 2px"
      borderColor="borders"
    >
      <HStack py={1} justify="space-between" mx={4}>
        <LeftNavContent />
        <RightNavContent />
      </HStack>
    </Box>
  );
}
