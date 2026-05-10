import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Admin lives outside the locale tree (AZ-only internal tool), so it must
  // bypass the i18n middleware altogether.
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
