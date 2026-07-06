import api from "./axios";
import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "@/types/file-upload";

/**
 * Ask the backend for a pre-signed PUT URL so the browser can upload directly to R2.
 */
export async function getPresignedUrl(
  request: PresignedUrlRequest,
): Promise<PresignedUrlResponse> {
  try {
    const response = await api.post<PresignedUrlResponse>(
      "/files/presigned-url",
      request,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get presigned URL:", error);
    throw new Error("Failed to get upload URL");
  }
}

/**
 * Upload a File directly to R2 via the pre-signed PUT URL.
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

/**
 * Delete an object from R2 by its key.
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  await api.delete(`/files/${key}`);
}

/**
 * Get a pre-signed GET URL for accessing private objects.
 */
export async function getPresignedGetUrl(key: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/files/url/${key}`);
  return data.url;
}

export const IMAGE_BASE_URL = "https://pub-e241c61f948e4305be60f7ca2b49676e.r2.dev";

export function getFullImageUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  const cleanBase = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  return `${cleanBase}/${key}`;
}

export function getImageKey(urlOrKey: string): string {
  if (!urlOrKey) return "";
  let path = urlOrKey;
  if (urlOrKey.includes("?")) {
    path = urlOrKey.split("?")[0];
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    const parts = path.split("/");
    return parts[parts.length - 1];
  }
  return path;
}
