import TeacherDashboard from "@/components/dashboard/teacher-dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard/StudentDashboard";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
  const { userData } = useUser();
  return userData?.role === "teacher" ? (
    <TeacherDashboard />
  ) : (
    <StudentDashboard />
  );
}
