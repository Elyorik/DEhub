// src/utils/cloudinaryUpload.ts

export type UploadedMedia = {
  url: string;
  type: "image" | "video" | "file";
};

const CLOUD_NAME = "daqlnggit";
const UPLOAD_PRESET = "dehub_unsigned";

function getResourceType(file: File): "image" | "video" | "raw" {
  if (!(file instanceof File)) {
    throw new Error("Passed value is not a File");
  }

  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";

  return "raw"; // pdf, zip, doc, etc
}

export async function uploadToCloudinary(
  file: File
): Promise<UploadedMedia> {
  console.log("📤 Uploading file:", file);

  const resourceType = getResourceType(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Cloudinary error:", data);
    throw new Error(data?.error?.message || "Upload failed");
  }

  return {
    url: data.secure_url,
    type:
      resourceType === "image"
        ? "image"
        : resourceType === "video"
        ? "video"
        : "file",
  };
}
