// Javni Supabase podaci za /os (public/os-app): URL i anon ključ, RLS čuva podatke.
export const dynamic = "force-static";

export function GET() {
  const env = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  return new Response(`window.OS_ENV=${JSON.stringify(env)};`, {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
}
