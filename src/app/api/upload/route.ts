import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// 브라우저가 Vercel Blob 으로 바로 올리게 토큰만 발급한다(함수 본문 4.5MB 한도 회피).
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/*", "audio/*"],
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "upload failed" }, { status: 400 });
  }
}
