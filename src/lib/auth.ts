import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const CLIENTE_COOKIE = "cliente_email";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

/**
 * Returns true if the admin session cookie is set.
 */
export async function isAdminAuthed(req?: NextRequest): Promise<boolean> {
  const cookieStore = req ? req.cookies : await cookies();
  const c = cookieStore.get(ADMIN_COOKIE);
  return c?.value === "true";
}

/**
 * Returns the cliente email from the cookie, or null.
 */
export async function getClienteEmail(req?: NextRequest): Promise<string | null> {
  const cookieStore = req ? req.cookies : await cookies();
  return cookieStore.get(CLIENTE_COOKIE)?.value ?? null;
}

export function setAdminCookie(): Record<string, string> {
  return {
    "Set-Cookie": `${ADMIN_COOKIE}=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  };
}

export function clearAdminCookie(): Record<string, string> {
  return {
    "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  };
}

export function setClienteCookie(email: string): Record<string, string> {
  const safe = encodeURIComponent(email);
  return {
    "Set-Cookie": `${CLIENTE_COOKIE}=${safe}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
  };
}

export function clearClienteCookie(): Record<string, string> {
  return {
    "Set-Cookie": `${CLIENTE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  };
}
