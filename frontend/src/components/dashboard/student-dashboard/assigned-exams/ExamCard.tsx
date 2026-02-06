import { Button, Flex, Text, Card } from "@chakra-ui/react";
import { NavLink } from "react-router";
import VocabularyTable from "@/components/common/VocabularyTable";

import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import StudentExamScoreCard from "./StudentExamScoreCard";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  return (
    <Flex flex="1" w="100vw" px={1}>
      <Card.Root variant="elevated">
        <Flex direction="column" flex="1">
          <Card.Header textStyle="heading.lg">
            {examData.exam.title}
          </Card.Header>
          <Card.Body gap={1}>
            <Text>Topic: {examData.exam.topic}</Text>
            <Text>Description: {examData.exam.description}</Text>
            <Text>Tenses: {JSON.parse(examData.exam.tenses).join(", ")}</Text>
            <Text>Target Vocabulary</Text>
            <VocabularyTable
              vocabularyListData={examData.exam.vocabulary_list}
            />
            <Text>Status: {examData.status}</Text>
            <Text>Due Date: {examData.due_date}</Text>
            {/* <NavLink to="/dashboard/exam">
        {examData.status != "in_progress" && "Start Exam"}
      </NavLink> */}
            {/* For now let's use a toggle instead of a separate route */}
            {examData.session_score && (
              <StudentExamScoreCard examScoreData={examData.session_score} />
            )}
            {!examData.session_score && (
              <NavLink to={`exam/session/${examData.id}`}>
                <Button>Start exam</Button>
              </NavLink>
            )}
          </Card.Body>
        </Flex>
      </Card.Root>
    </Flex>
  );
}
