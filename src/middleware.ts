import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const publicRoutes = ["/login", "/register", "/api/register", "/api/auth", "/api/uploadthing"]
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  if (isPublic) return NextResponse.next()
  if (!session) return NextResponse.redirect(new URL("/login", req.url))

  // Rediriger les non-admins hors de /admin
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}