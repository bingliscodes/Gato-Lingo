"use client";

import { useState } from "react";
import {
  Text,
  Flex,
  Field,
  Input,
  Stack,
  Button,
  Box,
  NativeSelect,
  Textarea,
  Heading,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";

import { toaster } from "@/components/ui/toaster";
import { useUser } from "@/contexts/UserContext";
import { createExam, type ExamDetails } from "@/utils/apiCalls";

export default function CreateExam() {
  const [error, setError] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  const [level, setLevel] = useState("beginner");
  const [topic, setTopic] = useState("Ordering food at a restaurant");
  const [vocabularyList, setVocabularyList] = useState(
    "menu, cuenta, mesero, propina, reservación, plato, bebida, postre",
  );
  const [verbTenses, setVerbTenses] = useState(["present", "preterite"]);
  const [regionVariant, setRegionVariant] = useState("");

  const { refreshUserData } = useUser();

  const nav = useNavigate();
  const toggleTense = (tense: string) => {
    setVerbTenses((prev) =>
      prev.includes(tense) ? prev.filter((t) => t !== tense) : [...prev, tense],
    );
  };

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const details: ExamDetails = {
      examTitle,
      regionVariant,
      targetLanguage,
      topic,
      verbTenses,
      level,
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
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg="bg.panel"
      maxW="500px"
      mx="auto"
    >
      <Heading size="lg" mb={6}>
        Configure Your Practice Session
      </Heading>

      <Stack gap={4}>
        <Field.Root>
          <Field.Label>Exam Title</Field.Label>
          <Input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Exam Title"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Exam Title</Field.Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the exam"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Target Language</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="italian">Italian</option>
              <option value="portuguese">Portuguese</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
              <option value="chinese">Chinese (Mandarin)</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label>Level</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label>Regional Variant (Optional)</Field.Label>
          <Input
            placeholder="e.g., Mexico, Argentina, Spain"
            value={regionVariant}
            onChange={(e) => setRegionVariant(e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Conversation Topic</Field.Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What would you like to talk about?"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Vocabulary to Practice</Field.Label>
          <Textarea
            value={vocabularyList}
            onChange={(e) => setVocabularyList(e.target.value)}
            placeholder="Enter words separated by commas"
            rows={3}
          />
          <Field.HelperText>Separate words with commas</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Verb Tenses to Practice</Field.Label>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {[
              "present",
              "preterite",
              "imperfect",
              "future",
              "conditional",
              "subjunctive",
            ].map((tense) => (
              <Button
                key={tense}
                size="sm"
                variant={verbTenses.includes(tense) ? "solid" : "outline"}
                colorPalette={verbTenses.includes(tense) ? "blue" : "gray"}
                onClick={() => toggleTense(tense)}
              >
                {tense.charAt(0).toUpperCase() + tense.slice(1)}
              </Button>
            ))}
          </Stack>
        </Field.Root>

        <Button onClick={handleSubmit} colorPalette="blue" size="lg" mt={4}>
          Create Exam
        </Button>
      </Stack>
    </Box>
  );
}
