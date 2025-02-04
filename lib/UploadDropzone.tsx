import { useCallback, useState } from "react";
import type { Accept, FileError } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { UploadFileResponse } from "./uploadFiles";
import { useUploadFiles } from "./useUploadFiles";
import { UploadSpinner } from "./UploadSpinner";

type UploadDropzoneState = {
  progress: number | null;
  isDragActive: boolean;
};

export function UploadDropzone(props: {
  /// Required props

  // Either the absolute upload URL or an async function that generates it
  uploadUrl: string | (() => Promise<string>);

  /// Optional functionality props

  // An object of with a common [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) as keys and an array of file extensions as values (similar to [showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker)'s types accept option)
  fileTypes?: Accept;
  // Whether the user can select multiple files to upload. Defaults to `false`
  multiple?: boolean;
  // Whether the upload should start right after the user drags the file in. Defaults to `false`
  uploadImmediately?: boolean;

  uploadLabel?: string;

  /// Optional life-cycle props

  // Called every time the combined upload progresses by at least 10 percent. `progress` % is a multiple of 10.
  onUploadProgress?: (progress: number) => void;
  // Called at the start of each upload.
  onUploadBegin?: (file: File) => void;
  // Called when all the files have been uploaded.
  onUploadComplete?: (uploaded: UploadFileResponse[]) => Promise<void> | void;
  // Called if there was an error at any point in the upload process.
  onUploadError?: (error: unknown) => void;
  // Called before each file upload to determine if it should proceed for uploading.
  shouldFileUpload?: (file: File) => FileError | null;

  onBeforeUpload?: (file: File) => Promise<File | File[] | null>;

  /// Optional appearance props

  // Text, if provided, is shown below the "Choose files" line
  subtitle?: string;
  // Replaces all of the content shown in the dropzone. `progress` % is a multiple of 10 if the upload is in progress or `null`.
  content?: (state: UploadDropzoneState) => string;
  // Replaces the `className` of the dropzone. `progress` % is a multiple of 10 if the upload is in progress or `null`.
  className?: (state: UploadDropzoneState) => string;

  // Add new prop for file change callback
  onFilesChange?: (files: File[]) => void;
}) {
  const { uploadImmediately, onBeforeUpload, onFilesChange } = props;
  const [files, setFiles] = useState<File[]>([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const { startUpload, isUploading } = useUploadFiles(props.uploadUrl, {
    onUploadComplete: async (res) => {
      setFiles([]);
      await props.onUploadComplete?.(res);
      setUploadProgress(0);
    },
    onUploadProgress: (p) => {
      setUploadProgress(p);
      props.onUploadProgress?.(p);
    },
    onUploadError: props.onUploadError,
    onUploadBegin: props.onUploadBegin,
  });

  const processFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const processedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const result = await onBeforeUpload!(file);
            // Handle both single file and array of files
            return Array.isArray(result) ? result : result;
          } catch (error) {
            console.error("Error processing file:", error);
            return null;
          }
        })
      );
      // Flatten the array and filter out nulls
      return processedFiles
        .flat()
        .filter((file): file is File => file !== null);
    },
    [onBeforeUpload]
  );

  // Modify setFiles to notify parent
  const updateFiles = useCallback(
    (newFiles: File[]) => {
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [onFilesChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const process = async () => {
        let filesToUpload;
        if (onBeforeUpload) {
          filesToUpload = await processFiles(acceptedFiles);
        } else {
          filesToUpload = acceptedFiles;
        }
        updateFiles(filesToUpload);

        if (uploadImmediately === true && filesToUpload.length > 0) {
          await startUpload(filesToUpload);
        }
      };

      process();
    },
    [uploadImmediately, onBeforeUpload, processFiles, startUpload, updateFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: props.fileTypes,
    disabled: false,
    validator: props.shouldFileUpload,
  });

  const onUploadClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (files.length === 0) {
      return;
    }

    void startUpload(files);
  };

  const combinedState = {
    isDragActive,
    progress: isUploading ? uploadProgress : null,
  };

  return (
    <div
      className={
        props.className?.(combinedState) ??
        twMerge(
          "flex flex-col items-center justify-center rounded-lg",
          "border-2 border-dashed border-input bg-background px-6 py-10",
          "transition-colors duration-200 ease-in-out",
          isDragActive && "border-primary bg-primary/5",
          files.length === 0 && "py-[4.25rem]"
        )
      }
      {...getRootProps()}
    >
      {props.content?.(combinedState) ?? (
        <div className="text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            className="mx-auto h-12 w-12"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765a4.5 4.5 0 0 1 8.302-3.046a3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      <label
        htmlFor="file-upload"
        className="mt-4 text-sm font-medium text-primary hover:text-primary/80 cursor-pointer"
      >
        {props.uploadLabel || "Choose files or drag and drop"}
        <input className="sr-only" {...getInputProps()} />
      </label>
      {props.subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{props.subtitle}</p>
      )}
      {files.length > 0 && (
        <button
          className={twMerge(
            "relative mt-4 flex h-10 w-36 items-center justify-center",
            "rounded-md text-primary-foreground transition-all duration-200",
            "overflow-hidden after:transition-[width] after:duration-500",
            isUploading
              ? `before:absolute before:-z-20 before:w-full before:h-full before:bg-muted ` +
                  `after:absolute after:-z-10 after:left-0 after:h-full after:bg-primary ${progressWidths[uploadProgress]}`
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={onUploadClick}
          disabled={isUploading}
        >
          <span className="relative z-10">
            {isUploading ? (
              <UploadSpinner />
            ) : (
              `Upload ${files.length} file${files.length === 1 ? "" : "s"}`
            )}
          </span>
        </button>
      )}
    </div>
  );
}

const progressWidths: Record<number, string> = {
  0: "after:w-0",
  10: "after:w-[10%]",
  20: "after:w-[20%]",
  30: "after:w-[30%]",
  40: "after:w-[40%]",
  50: "after:w-[50%]",
  60: "after:w-[60%]",
  70: "after:w-[70%]",
  80: "after:w-[80%]",
  90: "after:w-[90%]",
  100: "after:w-[100%]",
};
