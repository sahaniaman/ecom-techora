import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protected routes
const protectedRoutes = [
  '/admin(.*)',
  '/profile',
  '/orders',
  '/checkout',
  '/wishlist',
  '/settings',
];

const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};