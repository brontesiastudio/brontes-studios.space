/* ═══════════════════════════════════════════════════════════════
   BRONTES — Meta Conversions API relay

   Receives the payload assets/js/funnel.js POSTs to /api/track and forwards
   it to Meta's server-side Conversions API, reusing the same event_id the
   browser pixel already fired so Meta dedupes the pair instead of double
   counting it.

   Requires two environment variables set in the Netlify site config —
   never commit these:
     META_PIXEL_ID     — same id as <meta name="meta-pixel-id"> / fbq('init')
     META_ACCESS_TOKEN — a System User token (Business Manager → System Users)
                          with ads_management, scoped to that pixel
     META_TEST_EVENT_CODE — optional, from Events Manager → Test Events

   Until both required vars are set this is a silent no-op (204), matching
   the browser pixel's own "inert without an id" contract.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

const GRAPH_VERSION = 'v21.0';
const EVENT_ALLOWLIST = new Set(['PageView', 'ViewContent', 'InitiateCheckout', 'Lead', 'Purchase']);

const sanitizeParams = params => {
  if (!params || typeof params !== 'object') return undefined;
  const out = {};
  if (typeof params.value === 'number' && Number.isFinite(params.value)) out.value = params.value;
  if (typeof params.currency === 'string') out.currency = params.currency.slice(0, 3);
  if (Array.isArray(params.content_ids)) {
    out.content_ids = params.content_ids.filter(id => typeof id === 'string').slice(0, 20);
  }
  if (typeof params.content_type === 'string') out.content_type = params.content_type.slice(0, 32);
  if (typeof params.content_name === 'string') out.content_name = params.content_name.slice(0, 200);
  return Object.keys(out).length ? out : undefined;
};

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '' };
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    return { statusCode: 204, body: '' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: '' };
  }

  const { name, event_id: eventId, url, fbp, fbc, params } = payload;
  if (!EVENT_ALLOWLIST.has(name) || typeof eventId !== 'string' || !eventId) {
    return { statusCode: 400, body: '' };
  }

  const headers = event.headers || {};
  const clientIp = headers['x-nf-client-connection-ip']
    || (headers['x-forwarded-for'] || '').split(',')[0].trim()
    || undefined;

  const body = {
    data: [{
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: typeof url === 'string' ? url.slice(0, 2048) : undefined,
      action_source: 'website',
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: headers['user-agent'] || undefined,
        fbp: typeof fbp === 'string' ? fbp : undefined,
        fbc: typeof fbc === 'string' ? fbc : undefined,
      },
      custom_data: sanitizeParams(params),
    }],
  };

  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    await res.text();
  } catch {
    // Same contract as the browser send(): a failed relay never surfaces to the visitor.
  }

  return { statusCode: 204, body: '' };
};
