import { type ExamScoresResponse } from "@/utils/apiCalls";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { getExamScores } from "@/utils/apiCalls";

export default function ExamScoresDisplay() {
  const { examId } = useParams();
  const [examScoreData, setExamScoreData] = useState<ExamScoresResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getExamScoresAsync() {
      try {
        const res = await getExamScores(examId);
        setExamScoreData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getExamScoresAsync();
  }, [examId]);

  if (isLoading) return <div>Loading exam scores...</div>;
  if (!examScoreData) return <div>Exam not found</div>;

  console.log(examScoreData);
  return <h1>woooo</h1>;
}
