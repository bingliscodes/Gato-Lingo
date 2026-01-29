import { getCreatedExams, type DashboardExamResponse } from "@/utils/apiCalls";
import { useEffect, useState } from "react";
import AssignToStudentButton from "./exam-assignment/AssignToStudentButton";

export default function CreatedExams() {
  const [examData, setExamData] = useState<DashboardExamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getCreatedExams();
        setExamData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Exams</h1>
      {examData.map((item) => (
        <div key={item.exam.id}>
          <h2>{item.exam.title}</h2>
          <p>Topic: {item.exam.topic}</p>
          <p>
            Status: {item.completed}/{item.total_assigned} completed,
            {item.in_progress} in progress,
            {item.pending} pending
          </p>

          {/* List individual sessions if needed */}
          <ul>
            {item.sessions.map((session) => (
              <li key={session.id}>
                Student: {session.student_id} - {session.status}
              </li>
            ))}
          </ul>
          <AssignToStudentButton examId={item.exam.id} />
        </div>
      ))}
    </div>
  );
}
