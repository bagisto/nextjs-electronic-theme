import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const STATIC_PATHS = ["/_next/static", "/_next/image", "/favicon.ico", "/image/", "/fonts/"];

function isStaticPath(pathname: string): boolean {
  return STATIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  const restrictedPaths = ["/customer/login", "/customer/register"];
  if (restrictedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const bagistoOrigin = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT
    ? new URL(process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT).origin
    : "";

  const csp = [
    `default-src 'self'`,
    `base-uri 'none'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-inline'"}`,
    `img-src 'self' data: blob: ${bagistoOrigin} https://nextjs.bagisto.com`,
    `font-src 'self'`,
    `connect-src 'self' ${bagistoOrigin} https://nextjs.bagisto.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-csp", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
