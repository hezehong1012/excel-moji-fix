const ONE_YEAR = 60 * 60 * 24 * 365;
const CRAWLER = /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterest/i;
const langPath = (lang) => (lang === 'en' ? '/en/' : '/');

export default function middleware(request) {
  const url = new URL(request.url);

  const setlang = url.searchParams.get('setlang');
  if (setlang === 'ja' || setlang === 'en') {
    return new Response(null, {
      status: 307,
      headers: {
        Location: new URL(langPath(setlang), url.origin).toString(),
        'Set-Cookie': `lang=${setlang}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const ua = request.headers.get('user-agent') || '';
  if (CRAWLER.test(ua)) return;

  const cookieHeader = request.headers.get('cookie') || '';
  const remembered = (cookieHeader.match(/(?:^|;\s*)lang=(ja|en)/) || [])[1];
  if (remembered) {
    const want = langPath(remembered);
    if (url.pathname !== want) return Response.redirect(new URL(want, url.origin), 307);
    return;
  }

  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  if (!country) return;

  const want = langPath(country === 'JP' ? 'ja' : 'en');
  if (url.pathname !== want) return Response.redirect(new URL(want, url.origin), 307);
}

export const config = { matcher: ['/', '/en/'] };
