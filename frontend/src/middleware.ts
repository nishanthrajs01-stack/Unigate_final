import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session — IMPORTANT: do not remove this
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes — no auth required
    const publicRoutes = ["/login", "/signup", "/verify"];
    const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

    // If not logged in and accessing a protected route → redirect to login
    if (!user && !isPublic && pathname !== "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // If logged in and trying to access login/signup → redirect to dashboard
    if (user && (pathname === "/login" || pathname === "/signup")) {
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            const role = profile?.role || "student";
            const url = request.nextUrl.clone();
            url.pathname = role === "student" ? "/student" : "/admin";
            return NextResponse.redirect(url);
        } catch {
            // Profile doesn't exist yet — redirect to student dashboard
            const url = request.nextUrl.clone();
            url.pathname = "/student";
            return NextResponse.redirect(url);
        }
    }

    // Role-based route protection
    if (user && (pathname.startsWith("/admin") || pathname.startsWith("/student"))) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role || "student";

        // Students can't access admin routes
        if (role === "student" && pathname.startsWith("/admin")) {
            const url = request.nextUrl.clone();
            url.pathname = "/student";
            return NextResponse.redirect(url);
        }

        // Admin/counselor can't access student routes
        if ((role === "admin" || role === "counselor") && pathname.startsWith("/student")) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
