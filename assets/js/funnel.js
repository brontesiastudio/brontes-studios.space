/* ═══════════════════════════════════════════════════════════════
   BRONTES — funnel instrumentation

   One event goes to two places at once:

     browser  → Meta Pixel        (fires immediately, carries browser signals)
     server   → Conversions API   (survives ad blockers and ITP)

   Both carry the same event_id, which is how Meta deduplicates them. Without
   that shared id the same conversion is counted twice and every ratio in Ads
   Manager is wrong, so the id is generated once here and passed to both.

   Nothing runs until a pixel id is present in <meta name="meta-pixel-id">.
   With the tag absent the whole file is inert — no requests, no cookies —
   which is the state the site ships in until the id is filled in.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const PIXEL_ID = document.querySelector('meta[name="meta-pixel-id"]')?.content?.trim() || '';
  const CURRENCY = 'BRL';

  /* ───────────────────────────── the Meta pixel

     The one exception to "no CDN at runtime". Meta needs the browser-side tag
     for match quality — the server API alone loses fbp/fbc and the browser
     fingerprint — so connect.facebook.net is allowlisted in the CSP and
     nothing else is. */

  if (PIXEL_ID) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', PIXEL_ID);
  }

  /* ───────────────────────────── shared identifiers */

  const uuid = () => (crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const cookie = name => {
    const hit = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return hit ? decodeURIComponent(hit[2]) : null;
  };

  /* fbc is the click identifier Meta wants attached to a conversion. The pixel
     builds it from ?fbclid on the landing page — but only if the pixel loaded,
     so build it here too and let whichever exists win. */
  const clickId = () => {
    const stored = cookie('_fbc');
    if (stored) return stored;
    const fbclid = new URLSearchParams(location.search).get('fbclid');
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
  };

  /* ───────────────────────────── send

     Fires the pixel and the server call together. Neither is allowed to break
     the page: a blocked pixel, a 500 from our own endpoint, an offline phone —
     all of them fail silently and the visitor never notices. */

  const send = (name, params = {}) => {
    const eventId = uuid();

    if (window.fbq) {
      try { fbq('track', name, params, { eventID: eventId }); } catch { /* blocked */ }
    }

    const payload = JSON.stringify({
      name,
      event_id: eventId,
      url: location.href,
      referrer: document.referrer || null,
      fbp: cookie('_fbp'),
      fbc: clickId(),
      params,
    });

    // keepalive so the request still goes out when the click is navigating away.
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch { /* nothing to do */ }
  };

  /* ───────────────────────────── the funnel

     Four steps, in the order a buyer walks them. Purchase is the fifth and
     cannot be fired from here — it belongs on the checkout provider's thank-you
     page, where the order is actually confirmed. See docs/FUNNEL.md. */

  const productFromPage = () => {
    const main = document.querySelector('main');
    const label = main?.dataset.navCtaLabel || '';
    const price = label.match(/R\$(\d+)/);
    const slug = location.pathname.split('/').pop()?.replace('.html', '') || '';
    if (!price) return null;
    return {
      content_ids: [slug],
      content_type: 'product',
      content_name: document.querySelector('.pp-title')?.textContent?.trim() || slug,
      value: Number(price[1]),
      currency: CURRENCY,
    };
  };

  const track = () => {
    send('PageView');

    const product = productFromPage();
    if (product) send('ViewContent', product);

    // Every checkout CTA, including the one the nav rebuilds after an htmx swap.
    document.querySelectorAll('[data-checkout-pending], .btn-primary, .btn-dark, .nav-cta')
      .forEach(el => {
        if (el.dataset.tracked) return;
        el.dataset.tracked = '1';
        el.addEventListener('click', () => {
          send('InitiateCheckout', product || { currency: CURRENCY });
        });
      });

    const form = document.querySelector('#leadForm');
    if (form && !form.dataset.tracked) {
      form.dataset.tracked = '1';
      form.addEventListener('submit', () => send('Lead', { currency: CURRENCY }));
    }
  };

  track();
  // hx-boost swaps <main> without a page load, so the next step of the funnel
  // would otherwise never be recorded.
  document.body.addEventListener('htmx:afterSettle', track);
})();
