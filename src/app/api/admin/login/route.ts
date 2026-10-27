import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body?.password ?? "");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { ...setAdminCookie() } },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
