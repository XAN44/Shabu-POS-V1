// src/utils/cloudinary-uploader.ts
import { toast } from "sonner";

interface UploadResult {
  url: string;
  imageKey: string;
}

export const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ตรวจสอบข้อมูล Cloudinary credentials
  if (!cloudName || !uploadPreset) {
    const errorMsg =
      "Cloudinary credentials not found. Please check your .env.local file.";
    console.error(errorMsg);
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  // สร้าง FormData object สำหรับการอัปโหลด
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    // ส่ง request ไปยัง Cloudinary API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorDetail = errorData.error
        ? errorData.error.message
        : response.statusText;
      throw new Error(`Cloudinary upload failed: ${errorDetail}`);
    }

    const data = await response.json();
    console.log("Image uploaded to Cloudinary:", data);

    return {
      url: data.secure_url,
      imageKey: data.public_id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during upload.";
    console.error("Error uploading image:", error);
    toast.error(`อัปโหลดรูปภาพไม่สำเร็จ: ${errorMessage}`);
    throw error;
  }
};
