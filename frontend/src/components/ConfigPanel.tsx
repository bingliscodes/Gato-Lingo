import {
  Box,
  Button,
  Field,
  Input,
  Textarea,
  Stack,
  Heading,
  NativeSelect,
} from "@chakra-ui/react";
import { useState } from "react";

interface ConversationConfig {
  targetLanguage: string;
  level: string;
  topic: string;
  vocabulary: string[];
  verbTenses: string[];
  regionVariant?: string;
}

interface ConfigPanelProps {
  onStart: (config: ConversationConfig) => void;
  isConnected: boolean;
}

export const ConfigPanel = ({ onStart, isConnected }: ConfigPanelProps) => {
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  const [level, setLevel] = useState("beginner");
  const [topic, setTopic] = useState("Ordering food at a restaurant");
  const [vocabularyText, setVocabularyText] = useState(
    "menu, cuenta, mesero, propina, reservación, plato, bebida, postre",
  );
  const [verbTenses, setVerbTenses] = useState(["present", "preterite"]);
  const [regionVariant, setRegionVariant] = useState("");

  const handleStart = () => {
    const vocabulary = vocabularyText
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    onStart({
      targetLanguage,
      level,
      topic,
      vocabulary,
      verbTenses,
      regionVariant: regionVariant || undefined,
    });
  };

  const toggleTense = (tense: string) => {
    setVerbTenses((prev) =>
      prev.includes(tense) ? prev.filter((t) => t !== tense) : [...prev, tense],
    );
  };

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
          <Field.Label>Your Level</Field.Label>
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
            value={vocabularyText}
            onChange={(e) => setVocabularyText(e.target.value)}
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

        <Button
          colorPalette="blue"
          size="lg"
          onClick={handleStart}
          disabled={!isConnected}
          mt={4}
        >
          {isConnected ? "Start Conversation" : "Connecting..."}
        </Button>
      </Stack>
    </Box>
  );
};
