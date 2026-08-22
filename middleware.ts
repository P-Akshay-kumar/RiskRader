import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes (landing page stays fully public)
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const clerkHandler = clerkMiddleware((auth, req) => {
  // Protect all /dashboard routes
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export default function middleware(req: any, evt: any) {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pubKey || pubKey.includes("pk_test_demo_key")) {
    return NextResponse.next();
  }
  return clerkHandler(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webmanifest|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
