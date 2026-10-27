import { NextResponse } from "next/server";
import { clearClienteCookie } from "@/lib/auth";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { ...clearClienteCookie() } },
  );
}
