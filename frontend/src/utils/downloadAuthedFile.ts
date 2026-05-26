import { serverConfig } from "../configs/serverConfig";

export async function downloadAuthedFile(
  path: string,
  filename: string,
): Promise<void> {
  const token = localStorage.getItem("access_token");
  const url = `${serverConfig.url}/api/v1.0${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
