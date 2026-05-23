const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "bin",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/octet-stream": "bin",
};

function extractExtension(filename: string): string {
  const basename = filename.trim().split(/[/\\]/).pop() ?? "";
  const lastDot = basename.lastIndexOf(".");
  if (lastDot <= 0) return "";

  return basename
    .slice(lastDot + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);
}

function resolveExtension(filename: string, contentType?: string): string {
  const fromName = extractExtension(filename);
  if (fromName && ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName;
  }

  const fromMime = contentType ? MIME_TO_EXT[contentType] : undefined;
  if (fromMime && ALLOWED_EXTENSIONS.has(fromMime)) {
    return fromMime;
  }

  return "bin";
}

/** Normalizes client filenames before presign request (Cyrillic, spaces, paths). */
export function sanitizeUploadFilename(
  filename: string,
  contentType?: string,
): string {
  const basename = filename.trim().split(/[/\\]/).pop() ?? "upload";
  const lastDot = basename.lastIndexOf(".");
  const ext = resolveExtension(filename, contentType);

  const rawName = lastDot > 0 ? basename.slice(0, lastDot) : basename;
  const safeName =
    rawName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "upload";

  return `${safeName}.${ext}`;
}
