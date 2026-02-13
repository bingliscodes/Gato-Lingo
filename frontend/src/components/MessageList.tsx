import { Box, Stack, Text } from "@chakra-ui/react";
import { useRef, useEffect } from "react";

import { type ConversationTurn } from "@/hooks/useRealtimeAPI";

interface MessageListProps {
  messages: ConversationTurn[];
  isListening: boolean;
}

export const MessageList = ({ messages, isListening }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box flex="1" overflowY="auto" p={4} bg="bg.subtle">
      <Stack gap={4} maxW="800px" mx="auto">
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            alignSelf={msg.speaker === "student" ? "flex-end" : "flex-start"}
            maxW="80%"
          >
            <Box
              p={4}
              borderRadius="2xl"
              bg={msg.speaker === "student" ? "blue.500" : "bg.panel"}
              color={msg.speaker === "student" ? "white" : "fg"}
              borderBottomRightRadius={msg.speaker === "student" ? "sm" : "2xl"}
              borderBottomLeftRadius={msg.speaker === "tutor" ? "sm" : "2xl"}
              boxShadow={msg.speaker === "tutor" ? "md" : "none"}
            >
              <Text fontSize="xs" opacity={0.7} mb={1}>
                {msg.speaker === "student" ? "You" : "Tutor"}
              </Text>
              <Text>{msg.text}</Text>
            </Box>
          </Box>
        ))}

        {isListening && (
          <Box alignSelf="flex-end" maxW="80%">
            <Box
              p={4}
              borderRadius="2xl"
              bg="blue.300"
              color="white"
              borderBottomRightRadius="sm"
              opacity={0.7}
            >
              <Text>Listening...</Text>
            </Box>
          </Box>
        )}

        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
};
