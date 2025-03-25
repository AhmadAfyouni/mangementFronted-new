/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const useFileUpload = (uploadEndpoint: string) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (index: number, file: File | null) => {
    const updatedFiles = [...selectedFiles];
    if (file) {
      updatedFiles[index] = file;
    } else {
      updatedFiles.splice(index, 1);
    }
    setSelectedFiles(updatedFiles);
  };

  const uploadFiles = async () => {
    const filesData = selectedFiles.map((file) => ({
      fileName: file.name,
      contentType: file.type,
    }));

    const response = await axios.post(
      uploadEndpoint,
      { files: filesData },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      }
    );

    const uploadUrls = response.data.files.map((file: any) => file.uploadUrl);
    const downloadUrls = response.data.files.map(
      (file: any) => file.downloadUrl.split("?")[0]
    );

    for (const [index, url] of uploadUrls.entries()) {
      const file = selectedFiles[index];
      const binaryData = await readFileAsArrayBuffer(file);
      await axios.put(url, binaryData, {
        headers: {
          "Content-Type": file.type,
        },
      });
    }

    return downloadUrls;
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        reader.result
          ? resolve(reader.result as ArrayBuffer)
          : reject("Failed to read file");
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  return {
    selectedFiles,
    handleFileChange,
    uploadFiles,
  };
};
