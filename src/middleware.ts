import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/login", "/register", "/api/register"].some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // 1. Laisser passer les requêtes d'authentification API
  if (isApiAuthRoute) return NextResponse.next()

  // 2. Gérer les routes publiques
  if (isPublicRoute) {
    if (isLoggedIn) {
      // Si déjà connecté, on envoie vers le dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // 3. Si pas connecté -> Redirection vers /login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 4. Protection de la route Admin
  if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Matcher optimisé pour exclure les fichiers statiques et l'API
    runtime: 'nodejs',
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
