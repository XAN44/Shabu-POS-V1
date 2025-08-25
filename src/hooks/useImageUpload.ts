// hooks/useImageUpload.ts (Complete version)
import { useState, useCallback, useEffect } from "react";
import { MenuItem } from "@prisma/client";

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<UploadResult | null>;
  deleteImage: (publicId: string) => Promise<boolean>;
  uploading: boolean;
  uploadError: string | null;
  clearError: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return null;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return null;
      }

      setUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "อัพโหลดล้มเหลว");
        }

        const result = await response.json();
        return {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัพโหลด";
        setUploadError(errorMessage);
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(
    async (publicId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
          throw new Error("ลบภาพล้มเหลว");
        }

        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error("ลบภาพล้มเหลว:", error);
        return false;
      }
    },
    []
  );

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadError,
    clearError,
  };
};
