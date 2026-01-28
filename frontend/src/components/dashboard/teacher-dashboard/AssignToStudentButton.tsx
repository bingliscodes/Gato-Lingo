import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { getStudents, type StudentResponse } from "@/utils/apiCalls";

export interface AssignToStudentButtonProps {
  examId: string;
}

export default function AssignToStudentButton({
  examId,
}: AssignToStudentButtonProps) {
  const [studentData, setStudentData] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(examId);
  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getStudents();
        setStudentData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, []);

  if (isLoading) return <div>Loading students...</div>;
  if (error) return <div> Error: {error}</div>;

  return (
    <div>
      {studentData.map((student) => (
        <div key={student.id}>
          <h2>
            {student.first_name} {student.last_name}
          </h2>
        </div>
      ))}
    </div>
  );
}
