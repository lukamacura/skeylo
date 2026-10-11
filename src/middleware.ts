import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE, isAuthed } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Header da root layout može da sakrije site chrome (/admin, /calculator, /ils, /os).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";
  if (isAdmin && !isLogin) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!(await isAuthed(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/os" || pathname.startsWith("/os/")) {
    return osSession(req, requestHeaders);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Osvežava Supabase sesiju za /os i šalje neulogovane na /os/login.
async function osSession(req: NextRequest, requestHeaders: Headers) {
  let res = NextResponse.next({ request: { headers: requestHeaders } });
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          // Server komponente moraju da vide osvežen token, ne stari.
          requestHeaders.set("cookie", req.cookies.toString());
          res = NextResponse.next({ request: { headers: requestHeaders } });
          list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await sb.auth.getUser();

  const isOsLogin = req.nextUrl.pathname === "/os/login";
  if (!user && !isOsLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/os/login";
    return NextResponse.redirect(url);
  }
  if (user && isOsLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/os";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/calculator/:path*",
    "/calculator",
    "/ils/:path*",
    "/os",
    "/os/:path*",
  ],
};
