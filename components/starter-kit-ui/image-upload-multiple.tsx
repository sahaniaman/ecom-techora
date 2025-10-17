/** biome-ignore-all lint/a11y/noLabelWithoutControl: explanation */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: explanation */
"use client";

import { Check, Image as ImageIcon, Loader2, Upload, Video, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Types
 */
export interface UploadedAsset {
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface ImageUploadMultipleProps {
  endpoint?: string;
  /** image max size MB */
  maxImageSizeMB?: number;
  /** video max size MB */
  maxVideoSizeMB?: number;
  accept?: string;
  onComplete?: (uploadedUrls: string[]) => void; // Changed to string array
  label?: string;
  multiple?: boolean;
}

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error" | "canceled";
  error?: string;
  uploaded?: UploadedAsset;
}

export default function ImageUploadMultiple({
  endpoint = "/api/upload",
  maxImageSizeMB = 10,
  maxVideoSizeMB = 100,
  accept = "image/*,video/*",
  onComplete,
  label = "Upload Files",
  multiple = true,
}: ImageUploadMultipleProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [isDragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (!arr.length) return;

      const oversize = arr.find((f) => {
        if (f.type.startsWith("video/")) {
          return f.size > maxVideoSizeMB * 1024 * 1024;
        }
        return f.size > maxImageSizeMB * 1024 * 1024;
      });

      if (oversize) {
        const limit = oversize.type.startsWith("video/") ? maxVideoSizeMB : maxImageSizeMB;
        toast.error(
          `"${oversize.name}" is larger than ${limit}MB (${oversize.type.startsWith("video/") ? "video" : "image"})`
        );
        return;
      }

      const next: FileItem[] = arr.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        status: "queued",
      }));
      setItems((prev) => [...prev, ...next]);
    },
    [maxImageSizeMB, maxVideoSizeMB]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const startUpload = async () => {
    if (!items.length) {
      toast.message("Select files first");
      return;
    }

    setBusy(true);
    const uploadedUrls: string[] = []; // Array to collect URLs

    // helper type-safe patch updater
    type Patch = Partial<FileItem>;
    const makeUpdater = (id: string) => (patch: Patch) =>
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...(patch as Patch) } : p)));

    for (const it of items) {
      if (it.status === "done") continue;

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        const form = new FormData();
        form.append("files", it.file);

        const toastId = toast.loading(`Uploading ${it.file.name} — 0%`);
        const update = makeUpdater(it.id);

        update({ status: "uploading", progress: 0 });

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
            update({ progress: percent });
            toast.message(`Uploading ${it.file.name} — ${percent}%`, { id: toastId });
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            try {
              if (xhr.status >= 200 && xhr.status < 300) {
                // parse response safely and extract URLs
                try {
                  const json = JSON.parse(xhr.responseText);
                  
                  // Handle both response formats from your API
                  if (Array.isArray(json)) {
                    // Multiple files response
                    json.forEach((asset: UploadedAsset) => {
                      if (asset.secure_url) {
                        uploadedUrls.push(asset.secure_url);
                      }
                    });
                  } else if (json.uploads && Array.isArray(json.uploads)) {
                    // { uploads: [...] } format
                    json.uploads.forEach((upload: any) => {
                      if (upload.url) {
                        uploadedUrls.push(upload.url);
                      }
                    });
                  } else if (json.url) {
                    // Single file { url } format
                    uploadedUrls.push(json.url);
                  } else if (json.secure_url) {
                    // Direct secure_url
                    uploadedUrls.push(json.secure_url);
                  }
                } catch (err) {
                  console.error("Error parsing response:", err);
                }

                update({ status: "done", progress: 100 });
                toast.success(`Uploaded ${it.file.name}`, { id: toastId });
                resolve();
              } else {
                const msg = xhr.responseText || "Upload failed";
                update({ status: "error", error: msg });
                toast.error(`Failed: ${it.file.name}`, { id: toastId });
                resolve();
              }
            } catch (err) {
              update({ status: "error", error: "Unknown error" });
              toast.error(`Failed: ${it.file.name}`, { id: toastId });
              resolve();
            }
          }
        };

        xhr.onerror = () => {
          update({ status: "error", error: "Network error" });
          toast.error(`Network error: ${it.file.name}`);
          resolve();
        };

        xhr.open("POST", endpoint, true);
        xhr.send(form);
      });
    }

    setBusy(false);

    // Call onComplete with array of URLs
    if (onComplete && uploadedUrls.length > 0) {
      try {
        onComplete(uploadedUrls);
        toast.success(`Uploaded ${uploadedUrls.length} file(s) successfully`);
      } catch (err) {
        console.error("onComplete handler error:", err);
      }
    }

    // clear queue of successfully uploaded items
    setItems((prev) => prev.filter((p) => p.status !== "done"));
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      {label && <label className="block mb-2 font-medium">{label}</label>}

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3",
          "rounded-xl border-2 border-dashed p-8 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30",
        ].join(" ")}
      >
        <Upload className="h-6 w-6" />
        <div className="text-sm">
          <span className="font-medium">Drag & drop</span> files here or
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="gap-2"
            disabled={busy}
          >
            <Upload className="h-4 w-4" /> Choose Files
          </Button>
          <span className="text-xs text-muted-foreground">
            (Images up to {maxImageSizeMB}MB, Videos up to {maxVideoSizeMB}MB)
          </span>
        </div>
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {/* Queue */}
      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 border rounded-lg p-3">
              <div className="shrink-0 w-10 h-10 bg-muted rounded overflow-hidden flex items-center justify-center relative">
                {it.file.type.startsWith("image/") ? (
                  <Image 
                    src={URL.createObjectURL(it.file)} 
                    alt={it.file.name} 
                    className="object-cover w-full h-full" 
                    width={40}
                    height={40}
                  />
                ) : it.file.type.startsWith("video/") ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium">{it.file.name}</div>
                  <div className="text-xs text-muted-foreground">{(it.file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>

                <div className="h-2 w-full bg-muted rounded overflow-hidden mt-2">
                  <div className="h-full bg-primary transition-all" style={{ width: `${it.progress}%` }} />
                </div>

                <div className="mt-1 text-xs">
                  {it.status === "uploading" && (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading… {it.progress}%
                    </span>
                  )}
                  {it.status === "done" && (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Check className="h-3 w-3" /> Done
                    </span>
                  )}
                  {it.status === "error" && <span className="text-destructive">{it.error || "Failed"}</span>}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(it.id)}
                disabled={busy && it.status === "uploading"}
                className="shrink-0"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={startUpload} disabled={busy || items.length === 0} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Uploading…" : "Start Upload"}
        </Button>

        {items.length > 0 && (
          <Button variant="outline" onClick={() => setItems([])} disabled={busy}>
            Clear Queue
          </Button>
        )}
      </div>
    </div>
  );
}