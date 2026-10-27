import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { ...clearAdminCookie() } },
  );
}
