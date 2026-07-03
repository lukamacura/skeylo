import { NextResponse, type NextRequest } from "next/server";

// Ceo sajt je pod izradom - sve rute rewrite-uju na /construction.
// Da se vrati sajt uživo: obriši ovaj fajl.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/construction") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/construction";
  const response = NextResponse.rewrite(url);
  response.headers.set("x-construction", "1");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
