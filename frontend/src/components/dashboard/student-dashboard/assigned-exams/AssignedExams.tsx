import { useEffect, useState } from "react";
import { Flex, Text, Spinner, Separator } from "@chakra-ui/react";

import ExamCard from "./ExamCard";
import {
  getMyAssignments,
  type StudentAssignmentResponse,
} from "@/utils/apiCalls";

interface AssignedExamsProps {
  mode: string;
}

export default function AssignedExams({ mode }: AssignedExamsProps) {
  const [assignmentData, setAssignmentData] = useState<
    StudentAssignmentResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const data = await getMyAssignments();
        setAssignmentData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadAssignments();
  }, []);

  let filteredExams;

  filteredExams = assignmentData.filter((exam) => exam.status === mode);

  if (isLoading)
    return (
      <Flex align="center" justify="center" flex="1">
        <Spinner size="md" />
      </Flex>
    );
  if (error) return <div>Error: {error} </div>;
  if (!filteredExams)
    return (
      <Text mt={2} flex="1" textAlign="center" textStyle="heading.md">
        No assignments found, check back soon!
      </Text>
    );

  return (
    <Flex
      direction="column"
      bg="bg.subtle"
      border="solid {colors.accent} 3px"
      borderRadius="xl"
      w="50%"
    >
      <Text mx={2} py={2} textAlign="center" textStyle="heading.xl">
        {`${mode === "completed" ? "Completed" : "Assigned"} Exams`}
      </Text>
      <Separator size="lg" borderColor="fg.muted" />
      {filteredExams?.map((item) => (
        <ExamCard key={item.id} examData={item} />
      ))}
    </Flex>
  );
}
