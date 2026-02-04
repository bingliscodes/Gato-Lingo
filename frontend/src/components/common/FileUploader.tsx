import { Button } from "@chakra-ui/react";
import React, { useRef } from "react";

export interface FileUploaderProps {
  onFileUpload: (files: File) => void;
  acceptedFileTypes?: string;
  multiple?: boolean;
  label?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  acceptedFileTypes,
  multiple = false,
  label = "Upload File(s)",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }

    // Optional: reset the input value to allow the same file to be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
        style={{ display: "none" }} // Hide the actual input
      />
      <Button variant="outline" type="button" onClick={handleButtonClick}>
        {label}
      </Button>
    </div>
  );
};

export default FileUploader;
