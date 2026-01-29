import { useState, useCallback } from "react";

interface UseExamAssignmentReturn {
  assignedStudentIds: string[];
  assignExam: (studentIds: string[]) => Promise<void>;
  getAssignedStudentIds: () => string[];
  setAssignedStudentIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useExamAssignment = (): UseExamAssignmentReturn => {
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);

  const assignExam = (studentIds: string[]) => {};

  return {
    assignExam,
    assignedStudentIds,
    getAssignedStudentIds,
    setAssignedStudentIds,
  };
};
