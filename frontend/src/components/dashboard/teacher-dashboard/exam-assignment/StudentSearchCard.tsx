import { Flex, Text, Button } from "@chakra-ui/react";
import type { StudentResponse } from "@/utils/apiCalls";
import type { Dispatch, SetStateAction } from "react";

export interface StudentCardProps {
  studentData: StudentResponse;
  assignedStudentIds: string[];
  setAssignedStudentIds: Dispatch<SetStateAction<string[]>>;
}

export default function StudentCard({
  studentData,
  assignedStudentIds,
  setAssignedStudentIds,
}: StudentCardProps) {
  const handleClick = () => {
    if (!assignedStudentIds.includes(studentData.id)) {
      setAssignedStudentIds([...assignedStudentIds, studentData.id]);
      console.log(`adding student with id of ${studentData.id} to assignment`);
    } else {
      setAssignedStudentIds((prevIds) =>
        prevIds.filter((id) => {
          id !== studentData.id;
        }),
      );
      console.log(
        `removing student with id of ${studentData.id} from assignment`,
      );
    }
  };

  return (
    <Flex gap={4} align="center">
      <Text>
        {studentData.first_name} {studentData.last_name}
      </Text>
      <Button onClick={handleClick} size="xs">
        {assignedStudentIds.includes(studentData.id)
          ? "added"
          : "Add student to list"}
      </Button>
    </Flex>
  );
}
