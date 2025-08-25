// src/components/ui/ImageUpload.tsx
import React, { useState } from "react";
import Image from "next/image";

import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  previewUrl: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  previewUrl,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onImageChange(selectedFile);
  };

  const handleClearFile = () => {
    setFile(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file">รูปเมนู (ไม่จำเป็น)</Label>
      {previewUrl && (
        <div className="relative">
          <Image
            src={previewUrl}
            alt="Preview"
            width={500}
            height={500}
            className="w-full h-auto object-cover rounded aspect-video"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClearFile}
            className="absolute top-2 right-2 bg-white/50 hover:bg-white/80"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <Input
        id="file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
