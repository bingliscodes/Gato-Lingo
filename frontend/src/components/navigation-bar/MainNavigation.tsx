"use client";

import { HStack, Box } from "@chakra-ui/react";

import RightNavContent from "./RightNavContent.tsx";

export default function MainNavigation() {
  return (
    <Box
      bg="bg.nav"
      position="sticky"
      borderBottom="solid 2px"
      borderColor="borders"
    >
      <HStack justify="space-between" mx={4}>
        <RightNavContent />
      </HStack>
    </Box>
  );
}
