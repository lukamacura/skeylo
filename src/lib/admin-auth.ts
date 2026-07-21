// Password gate helperi. Radi u Node i Edge runtime-u (Web Crypto).
export const SESSION_COOKIE = "skeylo_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dana

// Deterministički token iz lozinke + tajne. Cookie čuva ovaj token.
export async function expectedToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const bytes = new TextEncoder().encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAuthed(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return token === (await expectedToken());
}
