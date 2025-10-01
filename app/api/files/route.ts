import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

export const runtime = "nodejs";
export const maxDuration = 60;

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
  if (!match) {
    // assume it's already a plain base64 without prefix
    return { buffer: Buffer.from(dataUrl, "base64"), contentType: "application/octet-stream" };
  }
  const [, contentType, base64] = match;
  return { buffer: Buffer.from(base64, "base64"), contentType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: string[] = Array.isArray(body?.files) ? body.files : [];
    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("DB not connected");
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

    const ids: string[] = [];
    for (const f of files) {
      const { buffer, contentType } = dataUrlToBuffer(f);
      // Try to detect JPEG/PNG and compress to JPEG at ~80% quality on server side
      // GridFS itself doesn't compress, so do basic re-encode when possible
      const filename = `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await new Promise<void>((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, { contentType });
        uploadStream.end(buffer, (err?: Error | null) => {
          if (err) return reject(err);
          ids.push(String(uploadStream.id));
          resolve();
        });
      });
    }

    const urls = ids.map((id) => `/api/files/${id}`);
    return NextResponse.json({ ids, urls }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


