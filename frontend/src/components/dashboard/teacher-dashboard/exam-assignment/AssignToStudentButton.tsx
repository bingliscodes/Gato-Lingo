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
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "An unknown error occurred while assigning student(s). Please try again later.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  const addedStudents = assignedStudentIds.length;

  return (
    <Flex gap={2} py={2}>
      <Dialog.Root open={isOpen}>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          Assign to students
        </Button>
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
                setDialogIsOpen={setIsOpen}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="solid"
                borderRadius="lg"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
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
