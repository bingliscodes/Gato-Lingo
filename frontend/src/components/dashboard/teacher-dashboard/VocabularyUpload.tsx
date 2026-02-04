import { useState } from "react";
import axios from "axios";
import { Input, Select, Button } from "@chakra-ui/react";

import FileUploader from "@/components/common/FileUploader";

interface VocabItem {
  word: string;
  translation: string;
  part_of_speech: string | null;
  example_sentence: string | null;
  regional_notes: string | null;
}

export default function VocabularyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "metadata">("upload");

  // List metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");

  async function handleFileSelect(file: File) {
    setFile(file);

    // Upload for preview
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/vocabulary-lists/preview", formData);

    setPreviewItems(response.data.items);
    setErrors(response.data.errors);
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
      {step === "upload" && <FileUploader onSelect={handleFileSelect} />}

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
          <Select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="spanish">Spanish</option>
            {/* ... */}
          </Select>
          <Button onClick={handleSave}>Save List</Button>
        </div>
      )}
    </div>
  );
}
