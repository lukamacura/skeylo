// Supabase klijent za OS na serveru: anon ključ + sesija iz cookie-ja,
// pa RLS (os.is_member) odlučuje šta ko vidi.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Person } from "@/lib/os/types";

export async function osServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "os" },
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          // Server komponente ne smeju da pišu cookie; middleware to već radi.
          try {
            list.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

/** Ulogovana osoba i ceo tim, jednom po zahtevu. */
export const getSession = cache(async () => {
  const sb = await osServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { user: null, me: null, team: [] as Person[] };
  const { data } = await sb.from("people").select("*").order("created_at");
  const team = (data ?? []) as Person[];
  return { user, me: team.find((p) => p.user_id === user.id) ?? null, team };
});
