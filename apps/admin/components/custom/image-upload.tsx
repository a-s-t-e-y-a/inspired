"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Compressor from "@uppy/compressor";
import ImageEditor from "@uppy/image-editor";
import { useFileUpload } from "@/hooks/use-file-upload";
import { deleteFileFromS3, getFullImageUrl, getImageKey, getPresignedGetUrl } from "@/lib/file-upload";
import type { UploadedFile } from "@/types/file-upload";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "@uppy/image-editor/css/style.min.css";

interface ImageUploadProps {
  onImagesChange: (
    images: Array<{
      file: File;
      alt: string;
      preview: string;
      finalUrl?: string;
      key?: string;
    }>,
  ) => void;
  initialImages?: Array<{ url: string; alt: string }>;
  maxFiles?: number;
  allowedFileTypes?: string[];
  disableCompression?: boolean;
}

interface UploadedImageWithId extends UploadedFile {
  id: string;
}

export function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxFiles = 10,
  allowedFileTypes = ["image/*"],
  disableCompression = false,
}: ImageUploadProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const { uploadFile, isUploading } = useFileUpload();

  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: maxFiles,
        allowedFileTypes: allowedFileTypes,
        maxFileSize: 50 * 1024 * 1024, // 50 MB
      },
      autoProceed: false,
    });

    if (!disableCompression) {
      uppyInstance.use(Compressor, { quality: 0.8, limit: 10, convertSize: 0 });
    }
    uppyInstance.use(ImageEditor, { quality: 0.8 });
    return uppyInstance;
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImageWithId[]>([]);
  const [altTexts, setAltTexts] = useState<Record<string, string>>({});
  const [uppyFileMap, setUppyFileMap] = useState<Map<string, string>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load initial images (e.g. from DB when editing existing records)
  useEffect(() => {
    if (initialImages.length > 0 && !hasInitialized.current) {
      const initialUploadedFiles: UploadedImageWithId[] = initialImages.map(
        (img, index) => {
          const uniqueId = `existing-${index}-${Date.now()}`;
          const resolvedUrl = getFullImageUrl(img.url);
          const resolvedKey = getImageKey(img.url);
          return {
            id: uniqueId,
            file: { name: uniqueId, type: "image/unknown", size: 0 } as unknown as File,
            alt: img.alt || "",
            preview: resolvedUrl,
            finalUrl: resolvedUrl,
            key: resolvedKey,
          };
        },
      );
      setUploadedImages(initialUploadedFiles);
      const alts: Record<string, string> = {};
      initialUploadedFiles.forEach((f) => {
        alts[f.id] = f.alt;
      });
      setAltTexts(alts);
      hasInitialized.current = true;
    }
  }, [initialImages]);

  // Mount Uppy Dashboard and wire events
  useEffect(() => {
    if (dashboardRef.current && !uppy.getPlugin("Dashboard")) {
      uppy.use(Dashboard, {
        inline: true,
        target: dashboardRef.current,
        height: 300,
        theme: "light",
        width: "100%",
        hideUploadButton: true,
        showRemoveButtonAfterComplete: true,
        proudlyDisplayPoweredByUppy: false,
      });
    }

    const doUpload = async (file: Parameters<typeof uploadFile>[0] & { id: string; meta: Record<string, unknown>; data: File }) => {
      if (file.meta.uploaded) return;
      try {
        const uploadedFile = await uploadFile(file.data, "");
        const imageId = `uploaded-${Date.now()}-${Math.random()}`;
        uppy.setFileMeta(file.id, { uploaded: true });
        setUploadedImages((prev) => [...prev, { ...uploadedFile, id: imageId }]);
        setUppyFileMap((prev) => new Map(prev).set(file.id, imageId));
      } catch {
        uppy.removeFile(file.id);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFileAdded = async (file: any) => {
      if (disableCompression) await doUpload(file);
      else uppy.upload();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFileRemoved = async (file: any) => {
      const imageId = uppyFileMap.get(file.id);
      if (!imageId) return;
      const image = uploadedImages.find((img) => img.id === imageId);
      if (image?.key) {
        try {
          await deleteFileFromS3(image.key);
        } catch (err) {
          console.warn("Failed to delete from R2:", err);
        }
      }
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      setUppyFileMap((prev) => {
        const m = new Map(prev);
        m.delete(file.id);
        return m;
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePreprocessComplete = async (file: any) => {
      await doUpload(file);
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("file-removed", handleFileRemoved);
    if (!disableCompression) uppy.on("preprocess-complete", handlePreprocessComplete);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("file-removed", handleFileRemoved);
      if (!disableCompression) uppy.off("preprocess-complete", handlePreprocessComplete);
    };
  }, [uppy, uploadedImages, uppyFileMap, disableCompression, uploadFile]);

  // Notify parent whenever images or alt texts change
  useEffect(() => {
    onImagesChange(
      uploadedImages.map((img, i) => ({
        file: img.file,
        alt: altTexts[img.id] || img.alt || `Image ${i + 1}`,
        preview: img.preview,
        finalUrl: img.finalUrl,
        key: img.key,
      })),
    );
  }, [uploadedImages, altTexts, onImagesChange]);

  const handleRemoveImage = useCallback(async (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    setAltTexts((prev) => {
      const n = { ...prev };
      delete n[imageId];
      return n;
    });
  }, []);

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newImages = [...uploadedImages];
    const [dragged] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, dragged);
    setUploadedImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Uppy Dashboard */}
      <div ref={dashboardRef} />

      {isUploading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Uploading...
        </p>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={[
                  "border rounded-lg p-3 space-y-2 relative group cursor-move transition-all",
                  draggedIndex === index ? "opacity-40 scale-95" : "",
                  dragOverIndex === index
                    ? "ring-2 ring-blue-500 border-blue-300"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-10 bg-red-500 hover:bg-red-600 text-white rounded p-1 transition-opacity"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>

                {/* Preview */}
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />

                {/* Alt text */}
                <input
                  type="text"
                  placeholder="Alt text (for SEO & accessibility)"
                  value={altTexts[image.id] || ""}
                  onChange={(e) =>
                    setAltTexts((prev) => ({
                      ...prev,
                      [image.id]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* Upload status */}
                {image.finalUrl && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Uploaded to R2
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
