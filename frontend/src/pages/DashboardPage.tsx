import { Flex } from "@chakra-ui/react";

import TeacherDashboard from "@/components/dashboard/teacher-dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard/StudentDashboard";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
  const { userData } = useUser();

  console.log(userData);
  return userData?.role === "teacher" ? (
    <TeacherDashboard />
  ) : (
    <StudentDashboard />
  );
}
