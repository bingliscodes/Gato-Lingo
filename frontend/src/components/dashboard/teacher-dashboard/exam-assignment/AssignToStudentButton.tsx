import { useState } from "react";
import { Button, Dialog, Flex } from "@chakra-ui/react";

import StudentSearch from "./StudentSearch";
import {
  type ExamAssignmentRequest,
  type ConversationSession,
  assignExamToStudents,
} from "@/utils/apiCalls";

export interface AssignToStudentButtonProps {
  examId: string;
}

export default function AssignToStudentButton({
  examId,
}: AssignToStudentButtonProps) {
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [data, setData] = useState<ConversationSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Fix allowing multiple assignments
  const handleExamAssignment = async (): Promise<void> => {
    try {
      const requestData: ExamAssignmentRequest = {
        student_ids: assignedStudentIds,
        exam_id: examId,
        due_date: null,
      };
      const res = await assignExamToStudents(requestData);
      setData(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
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
                <Button variant="solid" borderRadius="lg">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              {addedStudents > 0 && (
                <Button
                  variant="solid"
                  borderRadius="lg"
                  onClick={handleExamAssignment}
                >{`Assign to ${assignedStudentIds.length} student${addedStudents > 1 ? "s" : ""}`}</Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
}
