/* GIOTRADE Network - public read counter for article pages.
   Add to any article page, just before </body>:
   <script src="/assets/article-views.js" defer></script>
   The article slug is taken from the page's filename, and must exist in the article_views table. */
(function () {
  var SUPABASE_URL = 'https://ahtjhlspthpakywljmcn.supabase.co';
  var PUBLISHABLE_KEY = 'sb_publishable_MijMxsrGPSKXDOwgtx_fIw_i7WVtkE0';
  var MIN_TO_SHOW = 0; // only show the count once it reaches this number (raise it if early numbers look low)

  var slug = location.pathname.split('/').pop().replace(/\.html$/, '');
  var badge = document.querySelector('.article-issue-badge');
  if (!slug || !badge || navigator.webdriver) return;

  function rpc(fn) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug })
    }).then(function (r) { return r.ok ? r.json() : null; });
  }

  function show(n) {
    if (typeof n !== 'number' || n < MIN_TO_SHOW) return;
    var el = document.createElement('span');
    el.className = 'article-reads';
    el.textContent = '\u00B7 ' + n.toLocaleString('en-ZA') + (n === 1 ? ' read' : ' reads');
    badge.appendChild(el);
  }

  var key = 'gv_read_' + slug, seen = false;
  try { seen = !!localStorage.getItem(key); } catch (e) {}

  // Each browser counts once per article; repeat visits just show the current total.
  rpc(seen ? 'get_article_views' : 'record_article_view').then(function (n) {
    if (!seen) { try { localStorage.setItem(key, '1'); } catch (e) {} }
    show(n);
  }).catch(function () {});
})();
