import { baseApi } from "./baseApi";
import { serverConfig } from "../configs/serverConfig";

export type S3FileCategory =
  | "profiles"
  | "cars"
  | "orders"
  | "documents"
  | "warranties"
  | "employees";

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface PresignRequest {
  category: S3FileCategory;
  filename: string;
  contentType: string;
  expiresIn?: number;
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const token = localStorage.getItem("access_token");
  const presignRes = await fetch(
    `${serverConfig.url}/api/v1.0/storage/presign`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        category: "profiles",
        filename: file.name,
        contentType: file.type,
      } satisfies PresignRequest),
    }
  );

  if (!presignRes.ok) {
    throw new Error("Не удалось получить URL для загрузки");
  }

  const presign = (await presignRes.json()) as PresignResponse;

  const uploadRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Не удалось загрузить файл");
  }

  return presign.publicUrl;
}

export const storageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresignedUrl: builder.mutation<PresignResponse, PresignRequest>({
      query: (body) => ({
        url: "/storage/presign",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetPresignedUrlMutation } = storageApi;
