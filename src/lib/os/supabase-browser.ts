"use client";

import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof make> | undefined;

function make() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "os" } },
  );
}

export function osBrowser() {
  return (client ??= make());
}
