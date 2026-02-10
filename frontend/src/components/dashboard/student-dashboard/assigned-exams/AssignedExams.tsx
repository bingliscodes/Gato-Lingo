import { useEffect, useState } from "react";
import { Flex, Text, Spinner } from "@chakra-ui/react";

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

  if (mode === "completed")
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
    <Flex direction="column">
      <Text ml={2} fontSize="3xl" fontWeight="bolder">
        My exams
      </Text>
      {filteredExams?.map((item) => (
        <ExamCard key={item.id} examData={item} />
      ))}
    </Flex>
  );
}
