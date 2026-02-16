import { Flex, Button, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

import { useUser } from "@/contexts/UserContext";
import { startDemo, type ExamFormData } from "@/utils/apiCalls";

export default function LeftNavContent() {
  const { isLoggedIn, refreshUserData } = useUser();

  const nav = useNavigate();
  const handleDemo = async () => {
    try {
      const demoData: ExamFormData = {
        title: "Demo Exam",
        description: "Demo description",
        topic: "How cool cats are",
        target_language: "spanish",
        difficulty_level: "beginner",
        tenses: ["present", "preterite"],
      };
      const demoRes = await startDemo(demoData);
      console.log(demoRes);
      await refreshUserData();
      nav("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  return (
    <Flex>
      <Stack direction="row" align="center">
        {!isLoggedIn && (
          <Button variant="solid" size="sm" onClick={handleDemo}>
            Demo
          </Button>
        )}
      </Stack>
    </Flex>
  );
}
