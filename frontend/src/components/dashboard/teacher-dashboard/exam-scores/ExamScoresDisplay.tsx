import { type ConversationSession } from "@/utils/apiCalls";

interface ExamScoresDisplayProps {
  sessionScores: ConversationSession[];
}

export default function ExamScoresDisplay({
  sessionScores,
}: ExamScoresDisplayProps);
