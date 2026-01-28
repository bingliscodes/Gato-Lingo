import { useEffect, useState } from "react";
import { Button, Dialog, Flex } from "@chakra-ui/react";
import { getStudents, type StudentResponse } from "@/utils/apiCalls";
import StudentSearch from "./StudentSearch";

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
            Open Dialog
          </Button>
        </Dialog.Trigger>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog</Dialog.Title>
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
