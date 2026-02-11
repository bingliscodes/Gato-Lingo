import { useState } from "react";
import {
  Input,
  Button,
  NativeSelect,
  Flex,
  VStack,
  Text,
} from "@chakra-ui/react";

import {
  type VocabularyItemCreate,
  type VocabularyListResponse,
  createVocabularyList,
  previewVocabularyList,
} from "@/utils/apiCalls";
import FileUploader from "@/components/common/FileUploader";
import VocabularyTable from "@/components/common/VocabularyTable";

export default function VocabularyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabularyItemCreate[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "metadata">("upload");

  // List metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");

  async function handleFileUpload(file: File) {
    setFile(file);

    // Upload for preview
    const formData = new FormData();
    formData.append("file", file);

    const response = await previewVocabularyList(formData);

    setPreviewItems(response.items);
    setErrors(response.errors);
    setStep("preview");
  }

  async function handleSave() {
    await createVocabularyList({
      title,
      description,
      target_language: targetLanguage,
      items: previewItems,
    });

    // Navigate back to list
  }
  const cleanedPreviewItems = previewItems.map((item, idx) => ({
    id: idx,
    ...item,
  }));

  const obj: VocabularyListResponse = {
    id: "0",
    title: "list preview",
    description: null,
    target_language: null,
    teacher_id: null,
    items: cleanedPreviewItems,
  };

  return (
    <Flex flexDir="column" mt={2} flex="1" align="center">
      {step === "upload" && (
        <FileUploader
          onFileUpload={handleFileUpload}
          acceptedFileTypes=".csv"
          multiple={false}
          label="Upload Vocabulary List"
        />
      )}

      {step === "preview" && (
        <VStack gap={3}>
          <Text textStyle="heading.md">
            Preview ({previewItems.length} items)
          </Text>
          {errors.length > 0 && <div>Errors: {errors.join(", ")}</div>}

          <VocabularyTable vocabularyListData={obj} />
          <Button onClick={() => setStep("metadata")}>Continue</Button>
        </VStack>
      )}

      {step === "metadata" && (
        <Flex flexDir="column" flex="1" w="25rem" gap={2}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="List title"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          <NativeSelect.Root>
            <NativeSelect.Field
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="spanish">Spanish</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
          <Button onClick={handleSave}>Save List</Button>
        </Flex>
      )}
    </Flex>
  );
}
