import { Flex, Text, Button } from "@chakra-ui/react";
import type { StudentResponse } from "@/utils/apiCalls";

export interface StudentCardProps {
  studentData: StudentResponse;
  assignedStudentIds: string[];
  setAssignedStudentIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StudentCard({
  studentData,
  assignedStudentIds,
  setAssignedStudentIds,
}: StudentCardProps) {
  const handleClick = () => {
    setAssignedStudentIds([...assignedStudentIds, studentData.id]);
    console.log(`adding student with id of ${studentData.id} to assignment`);
  };

  return (
    <Flex>
      <Text>
        {studentData.first_name} {studentData.last_name}
      </Text>
      <Button onClick={handleClick}>
        {assignedStudentIds.includes(studentData.id)
          ? "added"
          : "Add student to list"}
      </Button>
    </Flex>
  );
}
