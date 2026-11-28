/* GIOTRADE Network - public read counter.
   Article pages: counts a read and shows "· N reads" next to the date.
   Listing pages (network.html, news/index.html): shows each article's total at the right of its "Read" row.
   Add before </body>:  <script src="/assets/article-views.js" defer></script> */
(function () {
  var SUPABASE_URL = 'https://ahtjhlspthpakywljmcn.supabase.co';
  var PUBLISHABLE_KEY = 'sb_publishable_MijMxsrGPSKXDOwgtx_fIw_i7WVtkE0';
  var MIN_TO_SHOW = 0; // only show a count once it reaches this number

  function rpc(fn, args) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function (r) { return r.ok ? r.json() : null; });
  }
  function label(n) { return n.toLocaleString('en-ZA') + (n === 1 ? ' read' : ' reads'); }
  function slugOf(href) {
    var m = (href || '').match(/\/news\/([^\/?#]+?)(?:\.html)?(?:[?#].*)?$/);
    return m ? m[1] : null;
  }

  // ---------- article page ----------
  var badge = document.querySelector('.article-issue-badge');
  if (badge) {
    if (navigator.webdriver) return;
    var slug = location.pathname.split('/').pop().replace(/\.html$/, '');
    var key = 'gv_read_' + slug, seen = false;
    try { seen = !!localStorage.getItem(key); } catch (e) {}
    rpc(seen ? 'get_article_views' : 'record_article_view', { p_slug: slug }).then(function (n) {
      if (!seen) { try { localStorage.setItem(key, '1'); } catch (e) {} }
      if (typeof n !== 'number' || n < MIN_TO_SHOW) return;
      var el = document.createElement('span');
      el.className = 'article-reads';
      el.textContent = '\u00B7 ' + label(n);
      badge.appendChild(el);
    }).catch(function () {});
    return;
  }

  // ---------- listing pages ----------
  var links = [].slice.call(document.querySelectorAll('a.news-card, a.card, a.news-feat-cta'));
  if (!links.length) return;
  rpc('get_all_article_views').then(function (rows) {
    if (!rows) return;
    var map = {};
    rows.forEach(function (r) { map[r.slug] = r.views; });
    links.forEach(function (a) {
      var s = slugOf(a.getAttribute('href')), n = map[s];
      if (typeof n !== 'number' || n < MIN_TO_SHOW) return;
      var isFeat = a.classList.contains('news-feat-cta');
      var link = isFeat ? a : a.querySelector('.news-card__link, .card__link');
      if (!link || !link.parentNode) return;
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%';
      link.parentNode.insertBefore(row, link);
      row.appendChild(link);
      var c = document.createElement('span');
      c.textContent = label(n);
      c.style.cssText = 'font-size:.75rem;opacity:.6;white-space:nowrap;margin-left:auto';
      row.appendChild(c);
    });
  }).catch(function () {});
})();
