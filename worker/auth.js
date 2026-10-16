// Decap CMS GitHub OAuth bridge — runs as a Cloudflare Worker.
// Secrets (set in the Worker's Settings → Variables): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// Flow: /auth → GitHub authorize → /callback → exchange code → postMessage token back to the CMS window.

const ALLOWED_ORIGINS = ['https://torahtalk.org', 'https://www.torahtalk.org', 'https://torahtalk.pages.dev'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      gh.searchParams.set('scope', 'repo,user');
      gh.searchParams.set('state', state);
      gh.searchParams.set('redirect_uri', `${url.origin}/callback`);
      return new Response(null, { status: 302, headers: { Location: gh.toString(), 'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
    }
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code'); const state = url.searchParams.get('state');
      const cookie = (request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/)?.[1];
      if (!code || !state || state !== cookie) return html(page('error', 'Invalid state'));
      const r = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'torahtalk-auth' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/callback` }),
      });
      const data = await r.json();
      if (!data.access_token) return html(page('error', data.error_description || 'No token'));
      return html(page('success', { token: data.access_token, provider: 'github' }));
    }
    if (url.pathname === '/') return new Response('Torah Talk admin auth', { status: 200 });
    return new Response('Not found', { status: 404 });
  },
};

const html = body => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
function page(status, payload) {
  const msg = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html><body><script>
(function(){
  var allowed = ${JSON.stringify(ALLOWED_ORIGINS)};
  function receive(e){ if (allowed.indexOf(e.origin) === -1) return; window.opener.postMessage(${JSON.stringify(msg)}, e.origin); window.removeEventListener('message', receive); }
  window.addEventListener('message', receive, false);
  allowed.forEach(function(o){ window.opener && window.opener.postMessage('authorizing:github', o); });
})();
</script><p>Signing you in… you can close this window if it doesn't close by itself.</p></body></html>`;
}
