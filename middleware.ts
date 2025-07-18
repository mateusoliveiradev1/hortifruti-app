
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/colaboradores/:path*",
    "/escalas/:path*",
    "/configuracoes/:path*",
    "/relatorios/:path*",
  ]
}
