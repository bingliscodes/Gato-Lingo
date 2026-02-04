import { useState } from "react";
import { Input, Button, NativeSelect } from "@chakra-ui/react";

import {
  type VocabItem,
  createVocabularyList,
  previewVocabularyList,
} from "@/utils/apiCalls";
import FileUploader from "@/components/common/FileUploader";

export default function VocabularyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "metadata">("upload");

  // List metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");

  async function handleFileUpload(file: File) {
    console.log("selected file:", file);
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

  return (
    <div>
      {step === "upload" && (
        <FileUploader
          onFileUpload={handleFileUpload}
          acceptedFileTypes=".csv"
          multiple={false}
          label="Upload Vocabulary List"
        />
      )}

      {step === "preview" && (
        <div>
          <h2>Preview ({previewItems.length} items)</h2>
          {errors.length > 0 && <div>Errors: {errors.join(", ")}</div>}
          <table>
            {previewItems.map((item, i) => (
              <tr key={i}>
                <td>{item.word}</td>
                <td>{item.translation}</td>
                <td>{item.part_of_speech}</td>
              </tr>
            ))}
          </table>
          <Button onClick={() => setStep("metadata")}>Continue</Button>
        </div>
      )}

      {step === "metadata" && (
        <div>
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
              {/* ... */}
            </NativeSelect.Field>
          </NativeSelect.Root>
          <Button onClick={handleSave}>Save List</Button>
        </div>
      )}
    </div>
  );
}
