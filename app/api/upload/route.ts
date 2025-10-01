import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Expect a JSON body: { files: ["data:image/...base64", ...] }
    const body = await req.json();
    const files: string[] = Array.isArray(body?.files) ? body.files : [];
    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Upload sequentially to simplify rate limits. Can be parallelized if needed.
    const results: string[] = [];
    for (const file of files) {
      const res = await cloudinary.uploader.upload(file, {
        folder: "travelbnb/listings",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      results.push(res.secure_url);
    }
    return NextResponse.json({ urls: results }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
