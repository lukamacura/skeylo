import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isAuthed } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Header da root layout može da sakrije site chrome (/admin, /calculator).
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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/calculator/:path*", "/calculator"],
};
