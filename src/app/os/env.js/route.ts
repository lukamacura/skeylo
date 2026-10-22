// Javni Supabase podaci za /os i /crm: URL i anon ključ (RLS čuva podatke)
// + granica za otpremanje kreativa (OS_UPLOAD_MAX_MB; besplatan Supabase plan = 50)
// + kvota Storage-a za traku zauzeća (OS_STORAGE_GB; Supabase Pro = 100).
export const dynamic = "force-static";

export function GET() {
  const env = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    uploadMaxMB: Number(process.env.OS_UPLOAD_MAX_MB) || 50,
    storageGB: Number(process.env.OS_STORAGE_GB) || 100,
  };
  return new Response(`window.OS_ENV=${JSON.stringify(env)};`, {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
}
