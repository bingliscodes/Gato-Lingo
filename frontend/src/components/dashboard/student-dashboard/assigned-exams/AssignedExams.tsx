import { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";

import ExamCard from "./ExamCard";
import {
  getMyAssignments,
  type StudentAssignmentResponse,
} from "@/utils/apiCalls";

export default function AssignedExams() {
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

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error} </div>;

  console.log(assignmentData);
  return (
    <Flex direction="column">
      <Text fontSize="3xl" fontWeight="bolder">
        My exams
      </Text>
      {assignmentData.map((item) => (
        <ExamCard key={item.id} examData={item} />
      ))}
    </Flex>
  );
}
