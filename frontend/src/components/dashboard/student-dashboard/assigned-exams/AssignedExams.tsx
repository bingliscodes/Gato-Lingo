import { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";

import ExamCard from "./ExamCard";
import {
  getMyAssignments,
  type StudentAssignmentResponse,
} from "@/utils/apiCalls";
import ExamScoreCard from "./ExamScoreCard";

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
      <Text> My exams</Text>
      {assignmentData.map((item) => (
        <Flex direction="column" key={item.id}>
          <ExamCard examData={item} />
          {item.session_score && (
            <ExamScoreCard examScoreData={item.session_score} />
          )}
        </Flex>
      ))}
    </Flex>
  );
}
