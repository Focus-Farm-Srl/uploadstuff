# UploadStuff

## Install

`npm install @lerealfede/uploadstuff`

## Docs

fork of:
[https://uploadstuff.dev](https://uploadstuff.dev)

Make it so on onUploadBegin will return a File instead of a string with the fileName.

Add shouldFileUpload to the UploadDropzone:
```
  shouldFileUpload?: (file: File) => FileError | null;
```
(same signature and behaviour as react-dropzone validator https://react-dropzone.js.org/)

Add onBeforeUpload to the UploadDropzone:
```
  onBeforeUpload?: (file: File) => Promise<File | null>;
```
return: null to exclude a file or File that should be update.
Unlike shouldFileUpload this accept async function and can also modify the file before the upload.

Add uploadLabel to UploadDropzone:
```
  uploadLabel?: string;
```
default value : "Choose files or drag and drop"

Made for my personal use.