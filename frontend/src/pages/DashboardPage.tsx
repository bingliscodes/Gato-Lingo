import TeacherDashboard from "@/components/dashboard/teacher-dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard/StudentDashboard";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
  const { userData } = useUser();
  //TODO: Make sure user data doesn't send password_hash
  console.log(userData);
  return <TeacherDashboard />;
  //   return userData?.role === "teacher" ? (
  //     <TeacherDashboard />
  //   ) : (
  //     <StudentDashboard />
  //   );
}
