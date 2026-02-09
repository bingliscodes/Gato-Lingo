import { Collapsible, Button, Flex, Text, Card } from "@chakra-ui/react";
import { NavLink } from "react-router";

import VocabularyTable from "@/components/common/VocabularyTable";
import { LuChevronRight } from "react-icons/lu";
import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import StudentExamScoreCard from "./StudentExamScoreCard";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger
        paddingY="3"
        display="flex"
        gap="2"
        alignItems="center"
      >
        <Collapsible.Indicator
          transition="transform 0.2s"
          _open={{ transform: "rotate(90deg)" }}
        >
          <LuChevronRight />
        </Collapsible.Indicator>
        {examData.exam.title}
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Card.Root variant="elevated">
          <Flex direction="column" flex="1">
            <Card.Header>{examData.exam.title}</Card.Header>
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
              {examData.session_score && (
                <StudentExamScoreCard examScoreData={examData.session_score} />
              )}
              {!examData.session_score && (
                <NavLink to={`dashboard/exam/session/${examData.id}`}>
                  <Button>Start exam</Button>
                </NavLink>
              )}
            </Card.Body>
          </Flex>
        </Card.Root>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
