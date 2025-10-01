import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return new Response("DB not connected", { status: 500 });
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

  try {
    const id = new mongoose.Types.ObjectId(params.id);
    const files = (await bucket.find({ _id: id }).toArray()) as Array<{
      contentType?: string;
    }>;
    if (!files.length) return new Response("Not found", { status: 404 });
    const contentType = files[0]?.contentType || "image/jpeg";
    const stream = bucket.openDownloadStream(id);
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
