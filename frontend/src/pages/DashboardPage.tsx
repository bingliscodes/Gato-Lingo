import TeacherDashboard from "@/components/dashboard/teacher-dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard/StudentDashboard";
import { useUser } from "@/contexts/UserContext";
import { Outlet } from "react-router";

export default function DashboardPage() {
  const { userData } = useUser();
  return userData?.role === "teacher" ? (
    <TeacherDashboard />
  ) : (
    <StudentDashboard />
  );
}

export function DashboardLayout() {
  return <Outlet />;
}
