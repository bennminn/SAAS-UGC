import { NextResponse } from "next/server";
import { AVATARS } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({ avatars: AVATARS });
}
