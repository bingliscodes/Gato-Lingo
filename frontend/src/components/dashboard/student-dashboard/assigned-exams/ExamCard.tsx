import {
  Collapsible,
  Button,
  Flex,
  Text,
  Card,
  Separator,
} from "@chakra-ui/react";
import { NavLink } from "react-router";

import VocabularyTable from "@/components/common/VocabularyTable";
import { LuChevronRight } from "react-icons/lu";
import { type StudentAssignmentResponse } from "@/utils/apiCalls";
import StudentExamScoreCard from "./StudentExamScoreCard";
import ExamCardItem from "@/components/common/ExamCardItem";

interface ExamCardProps {
  examData: StudentAssignmentResponse;
}

export default function ExamCard({ examData }: ExamCardProps) {
  return (
    <Collapsible.Root ml={2}>
      <Collapsible.Trigger
        paddingY="3"
        display="flex"
        gap="2"
        alignItems="center"
        textStyle="body.lg"
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
              <ExamCardItem title="Topic" data={examData.exam.topic} />
              <ExamCardItem
                title="Description"
                data={examData.exam.description}
              />
              <ExamCardItem
                title="Tenses"
                data={JSON.parse(examData.exam.tenses).join(", ")}
              />
              <Separator size="md" />
              <Text textAlign="center" textStyle="heading.md">
                Target Vocabulary
              </Text>
              <VocabularyTable
                vocabularyListData={examData.exam.vocabulary_list}
              />
              <ExamCardItem title="Status" data={examData.status} />
              <ExamCardItem title="Due Date" data={examData.due_date} />
              <Separator size="md" />
              {examData.session_score && (
                <StudentExamScoreCard examScoreData={examData.session_score} />
              )}
              {!examData.session_score && (
                <NavLink to={`session/${examData.id}`}>
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
