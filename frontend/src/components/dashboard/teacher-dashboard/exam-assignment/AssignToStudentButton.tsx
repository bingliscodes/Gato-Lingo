import { Button, Dialog, Flex } from "@chakra-ui/react";
import StudentSearch from "../StudentSearch";

export interface AssignToStudentButtonProps {
  examId: string;
}

export default function AssignToStudentButton({
  examId,
}: AssignToStudentButtonProps) {
  return (
    <Flex>
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
              <StudentSearch />
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
    </Flex>
  );
}
