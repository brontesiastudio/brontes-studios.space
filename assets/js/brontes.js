/* ═══════════════════════════════════════════════════════════════
   BRONTES — site behaviour
   The original site's interactions, kept intact: loading overlay,
   drawer, FAQ accordion, lead modal. Everything is idempotent so htmx
   can re-run it after a boosted page swap.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ───────────────────────────── loading overlay */

  const hideLoader = () => {
    $('#loading-overlay')?.classList.add('hidden');
    $('#load-bar')?.classList.add('done');
  };
  if (document.readyState === 'complete') hideLoader();
  else addEventListener('load', hideLoader);
  // A stalled video must never leave the overlay up.
  setTimeout(hideLoader, 4000);

  /* ───────────────────────────── drawer */

  const drawer = $('#drawer');
  const scrim = $('#drawer-overlay');
  const openDrawer = open => {
    drawer?.classList.toggle('open', open);
    scrim?.classList.toggle('open', open);
    $('#menu-btn')?.setAttribute('aria-expanded', String(open));
  };
  $('#menu-btn')?.addEventListener('click', () => openDrawer(!drawer.classList.contains('open')));
  scrim?.addEventListener('click', () => openDrawer(false));
  $$('#drawer a').forEach(a => a.addEventListener('click', () => openDrawer(false)));

  /* ───────────────────────────── FAQ
     Kept as the original's global so the inline onclick handlers in the
     markup keep working. */

  window.toggleFaq = i => {
    const body = document.getElementById('faq-' + i);
    const icon = document.getElementById('icon-' + i);
    if (!body) return;
    const open = body.classList.toggle('open');
    icon?.classList.toggle('open', open);
    body.previousElementSibling?.setAttribute('aria-expanded', String(open));
  };

  /* ───────────────────────────── lead modal */

  const overlay = $('#leadModalOverlay');
  const setModal = open => {
    overlay?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  $$('[data-lead-open]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    setModal(true);
  }));
  $('#leadModalClose')?.addEventListener('click', () => setModal(false));
  $('#leadSuccessClose')?.addEventListener('click', () => setModal(false));
  overlay?.addEventListener('click', e => { if (e.target === overlay) setModal(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setModal(false); });

  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('.lead-field', form).forEach(f => {
      const c = $('input, select', f);
      const good = c.checkValidity();
      f.classList.toggle('bad', !good);
      if (!good) ok = false;
    });
    if (!ok) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const endpoint = form.dataset.endpoint;
    const btn = $('#leadSubmitBtn');
    const label = $('#leadSubmitText');

    if (!endpoint) {
      // No backend wired up — hand it to the mail client rather than
      // showing a success screen for something nobody received.
      const body = Object.entries(data).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join('\n');
      location.href = `mailto:${form.dataset.mailto}` +
        `?subject=${encodeURIComponent('Inscrição para anúncio de IA grátis')}` +
        `&body=${encodeURIComponent(body)}`;
      return;
    }

    btn.disabled = true;
    label.textContent = 'Enviando…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
      $('#leadFormState').style.display = 'none';
      $('#leadSuccessState').style.display = 'flex';
    } catch {
      btn.disabled = false;
      label.textContent = 'Enviar inscrição';
    }
  });

  /* ───────────────────────────── per-page content
     htmx swaps <main> only, so the nav, drawer, modal and footer keep their
     listeners — but anything inside main has to be wired up again after a
     boosted navigation. Everything below is idempotent and re-runnable. */

  let tileObserver = null;

  const initVideos = () => {
    // The original set autoplay on every tile at once. Play only what is on
    // screen instead — same look, far less decoding.
    const videos = $$('video[data-tile]');
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) {
      videos.forEach(v => { v.preload = 'auto'; v.play().catch(() => {}); });
      return;
    }
    tileObserver?.disconnect();
    tileObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) { target.pause(); return; }
        if (!target.dataset.armed) {
          target.dataset.armed = '1';
          target.preload = 'auto';
          target.load();
        }
        target.play().catch(() => {});
      });
    }, { rootMargin: '200px' });
    videos.forEach(v => tileObserver.observe(v));
  };

  const initFilm = () => {
    const film = $('[data-film]');
    if (!film || film.dataset.wired) return;
    film.dataset.wired = '1';

    const video = $('video', film);
    const btn = $('[data-mute]', film);
    const ON = 'M11 5 6 9H2v6h4l5 4V5z';
    const OFF = 'M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6';

    video.addEventListener('loadeddata', () => {
      film.classList.add('has-film');
      video.play().catch(() => {});
    });
    video.addEventListener('error', () => film.classList.remove('has-film'));

    btn?.addEventListener('click', () => {
      video.muted = !video.muted;
      $('path', btn)?.setAttribute('d', video.muted ? OFF : ON);
      if (!video.muted) video.play().catch(() => {});
    });

    // The reel source is whatever /admin published; the markup src is the
    // fallback for when there are no functions behind the page.
    fetch('/api/reel', { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!d || !d.src || d.src === video.getAttribute('src')) return;
        video.src = d.src;
        video.load();
      })
      .catch(() => {});

    setTimeout(() => { if (!video.videoWidth) film.classList.remove('has-film'); }, 4000);
  };

  /* Checkout URLs are not wired yet. Rather than send anyone to the retired
     domain, those CTAs do nothing and say so. */
  const initPending = () => {
    $$('[data-checkout-pending]').forEach(a => {
      if (a.dataset.wired) return;
      a.dataset.wired = '1';
      a.addEventListener('click', e => {
        e.preventDefault();
        if (a.nextElementSibling?.classList.contains('checkout-note')) return;
        const note = document.createElement('span');
        note.className = 'checkout-note';
        note.textContent = 'O checkout abre em breve.';
        a.insertAdjacentElement('afterend', note);
      });
    });
  };


  /* The nav sits outside <main>, the only thing htmx swaps, so a boosted
     navigation left the previous page's priced CTA in place — landing on
     Cinematic still offered "Garantir o Combo · R$79". Each page carries its own
     CTA on <main>; sync the nav from it after every swap. */
  const syncNavCta = () => {
    const main = $('main');
    const bar = $('.nav-inner');
    if (!bar) return;
    let cta = $('.nav-cta', bar);
    const label = main?.dataset.navCtaLabel;

    if (!label) { cta?.remove(); return; }
    if (!cta) {
      cta = document.createElement('a');
      cta.className = 'nav-cta';
      cta.setAttribute('hx-boost', 'false');
      bar.appendChild(cta);
    }
    cta.innerHTML = label;
    cta.setAttribute('href', main.dataset.navCtaHref || '#');
    cta.toggleAttribute('data-checkout-pending', 'navCtaPending' in main.dataset);
    delete cta.dataset.wired;
  };

  const initPage = () => {
    syncNavCta();
    initVideos();
    initFilm();
    initPending();
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  };

  initPage();
  document.body.addEventListener('htmx:afterSwap', initPage);
  // A boosted navigation keeps the scroll position; the original's full page
  // loads always started at the top.
  document.body.addEventListener('htmx:afterSettle', () => scrollTo(0, 0));
})();
