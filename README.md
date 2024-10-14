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
(same signature as react-dropzone validator https://react-dropzone.js.org/)
Made for my personal use.