export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pipeline/:path*',
    '/notes/:path*',
    '/calendar/:path*',
    '/graph/:path*',
    '/settings/:path*',
  ],
};
