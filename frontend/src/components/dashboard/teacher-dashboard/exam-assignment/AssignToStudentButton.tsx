import { useState } from "react";
import { Button, Dialog, Flex } from "@chakra-ui/react";
import StudentSearch from "./StudentSearch";

export interface AssignToStudentButtonProps {
  examId: string;
}

export interface ExamAssignmentRequest {
  exam_id: string;
  student_ids: string[];
  due_date: string;
}

export default function AssignToStudentButton({
  examId,
}: AssignToStudentButtonProps) {
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);

  const addedStudents = assignedStudentIds.length;
  return (
    <Flex gap={2} py={2}>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="outline" size="sm">
            Assign to students
          </Button>
        </Dialog.Trigger>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Select students</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <StudentSearch
                assignedStudentIds={assignedStudentIds}
                setAssignedStudentIds={setAssignedStudentIds}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
      {addedStudents > 0 && (
        <Button
          variant="outline"
          size="sm"
        >{`Assign to ${assignedStudentIds.length} student${addedStudents > 1 ? "s" : ""}`}</Button>
      )}
    </Flex>
  );
}
