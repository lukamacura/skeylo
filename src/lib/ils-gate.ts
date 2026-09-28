// Password gate za /ils stranice. Koristi se samo na serveru (page + server
// action), tako da lozinka i sadržaj plana ne ulaze u klijentski bundle.
export const ILS_PASS = "drdragan";
export const ILS_COOKIE = "ils_plan";
export const ILS_MAX_AGE = 60 * 60 * 24 * 30; // 30 dana

// Cookie čuva heš, ne samu lozinku.
export async function ilsToken(): Promise<string> {
  const bytes = new TextEncoder().encode(`ils-marketing-plan:${ILS_PASS}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isIlsUnlocked(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  return token === (await ilsToken());
}
