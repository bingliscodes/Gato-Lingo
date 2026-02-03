import { getCreatedExams, type DashboardExamResponse } from "@/utils/apiCalls";
import { useEffect, useState } from "react";
import CreatedExamCard from "./CreatedExamCard";

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
        <CreatedExamCard key={item.exam.id} examData={item} />
      ))}
    </div>
  );
}
