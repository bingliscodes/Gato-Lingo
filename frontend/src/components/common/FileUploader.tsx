import React, { useRef } from "react";

interface FileUploaderProps {
  onFileUpload: (files: FileList | null) => void;
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event.target.files);
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
      <button type="button" onClick={handleButtonClick}>
        {label}
      </button>
    </div>
  );
};

export default FileUploader;
