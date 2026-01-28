"use client";

import { useState } from "react";
import { Text, Flex, Field, Input, Stack, Button } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";

import { toaster } from "@/components/ui/toaster";
import { useUser } from "@/contexts/UserContext";

interface ExamDetails {
  culturalContext: string | null;
  targetLanguage: string;
  topic: string;
  tenses: string | null;
  difficultyLevel: string;
  vocabularyList: string;
}

export default function CreateExam() {
  const [error, setError] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [topic, setTopic] = useState("");
  const [tenses, setTenses] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [vocabularyList, setVocabularyList] = useState("");

  const { refreshUserData } = useUser();

  const nav = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const details: ExamDetails = {
      culturalContext,
      targetLanguage,
      topic,
      tenses,
      difficultyLevel,
      vocabularyList,
    };

    // const loginPromise = login(credentials);

    toaster.promise(loginPromise, {
      loading: {
        title: "Logging In...",
        description: "Checking your credentials.",
      },
      success: {
        title: "Login Successful!",
        description: "Redirecting to homepage.",
      },
      error: { title: "Error", description: "Login failed." },
    });

    try {
      await loginPromise;
      setError(null);
      await refreshUserData();
      nav("/");
    } catch (err) {
      if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: "An unexpected error occurred" });
      }
      console.error(err);
    }
  }

  return (
    <Flex
      direction="column"
      gap={4}
      py={2}
      align="center"
      justify="center"
      flex="1"
      mt="-8rem"
    >
      <Flex as="form" onSubmit={handleSubmit} justify="center" w="100%">
        <Flex
          mt={2}
          justify="center"
          direction="column"
          gap={4}
          py={6}
          w="50%"
          bgGradient="sidebar"
          p={6}
          borderRadius="1rem"
        >
          <Text fontSize="3xl" fontWeight="bold" color="text.sidebar">
            Create new exam
          </Text>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Exam Title</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="exam title"
              name="examTitle"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Description</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="provide a brief description of the exam"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Cultural Context</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="cultural context"
              name="culturalContext"
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>

          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Target Language</Field.Label>
            <Input
              placeholder="target language"
              name="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Topic</Field.Label>
            <Input
              placeholder="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Tenses</Field.Label>
            <Input
              placeholder="tenses"
              name="tenses"
              value={tenses}
              onChange={(e) => setTenses(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Difficulty Level</Field.Label>
            <Input
              placeholder="difficulty level"
              name="difficultyLevel"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Vocabulary List</Field.Label>
            <Input
              placeholder="vocabulary list"
              name="vocabularyList"
              value={vocabularyList}
              onChange={(e) => setVocabularyList(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          {error && (
            <Text fontSize="sm" color="red.400">
              {error.message}
            </Text>
          )}
          <Button
            mx={4}
            mt={2}
            type="submit"
            textStyle="xl"
            _hover={{ bg: "bg.secondaryBtnHover" }}
          >
            Create Exam
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
