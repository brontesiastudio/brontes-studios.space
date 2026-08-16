/* ═══════════════════════════════════════════════════════════════
   Reel control — talks to /api/admin/*
   The token lives in sessionStorage: gone when the tab closes.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const TOKEN_KEY = 'brontes.reel.token';

  let token = sessionStorage.getItem(TOKEN_KEY) || '';
  let picked = null;
  let limits = { maxBytes: 40 * 1024 * 1024 };

  const mb = bytes => (bytes / 1048576).toFixed(1) + ' MB';

  const say = (message, bad = false, el = $('#status')) => {
    el.textContent = message;
    el.classList.toggle('is-bad', bad);
  };

  const api = async (path, { method = 'GET', body, raw = false } = {}) => {
    const headers = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (body && !raw) headers['content-type'] = 'application/json';

    const res = await fetch(path, {
      method,
      headers,
      body: raw ? body : body ? JSON.stringify(body) : undefined,
    });

    let data = {};
    try { data = await res.json(); } catch { /* empty body is fine */ }

    if (res.status === 401 && token) {
      signOut();
      throw new Error('Sessão expirada. Entre novamente.');
    }
    if (!res.ok || data.ok === false) throw new Error(data.error || `Falha na requisição (${res.status})`);
    return data;
  };

  /* ───────────────────────────── gate */

  const showConsole = () => {
    $('#gate').hidden = true;
    $('#console').hidden = false;
    $('#signOut').hidden = false;
    refresh();
    loadFunnel();
  };

  function signOut() {
    token = '';
    sessionStorage.removeItem(TOKEN_KEY);
    $('#gate').hidden = false;
    $('#console').hidden = true;
    $('#signOut').hidden = true;
  }

  $('#signOut').addEventListener('click', signOut);

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const button = $('#loginBtn');
    button.disabled = true;
    say('Verificando…', false, $('#loginNote'));
    try {
      const { token: fresh } = await api('/api/admin/login', {
        method: 'POST',
        body: { password: $('#password').value },
      });
      token = fresh;
      sessionStorage.setItem(TOKEN_KEY, token);
      $('#password').value = '';
      say('', false, $('#loginNote'));
      showConsole();
    } catch (err) {
      say(err.message, true, $('#loginNote'));
    } finally {
      button.disabled = false;
    }
  });

  /* ───────────────────────────── current state */

  async function refresh() {
    try {
      const { config, limits: caps } = await api('/api/admin/reel');
      if (caps) {
        limits = caps;
        $('#capLabel').textContent = Math.round(caps.maxBytes / 1048576) + ' MB';
      }

      const player = $('#livePreview');
      const shell = player.parentElement;
      const src = config.mode === 'url' ? config.url
                : config.mode === 'file' ? `/api/reel/file?v=${config.updatedAt || 0}`
                : '';

      shell.classList.toggle('has-video', Boolean(src));
      player.src = src || '';

      $('#metaMode').textContent =
        config.mode === 'url' ? 'URL externa'
        : config.mode === 'file' ? 'Arquivo enviado'
        : 'Padrão do pacote';
      $('#metaName').textContent = config.fileName || config.url || '—';
      $('#metaSize').textContent = config.fileSize ? mb(config.fileSize) : '—';
      $('#metaUpdated').textContent = config.updatedAt
        ? new Date(config.updatedAt).toLocaleString('pt-BR')
        : '—';
    } catch (err) {
      say(err.message, true);
    }
  }

  /* ───────────────────────────── file picking */

  const drop = $('#drop');
  const input = $('#file');

  const choose = file => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      say('Isso não é um arquivo de vídeo.', true);
      return;
    }
    if (file.size > limits.maxBytes) {
      say(`${mb(file.size)} passa do limite de ${Math.round(limits.maxBytes / 1048576)} MB ` +
          `para upload. Hospede o arquivo em outro lugar e cole a URL.`, true);
      return;
    }
    picked = file;
    drop.classList.add('is-set');
    $('#dropText').textContent = `${file.name} · ${mb(file.size)}`;
    $('#uploadBtn').disabled = false;
    say('');
  };

  input.addEventListener('change', () => choose(input.files[0]));

  ['dragenter', 'dragover'].forEach(type =>
    drop.addEventListener(type, e => {
      e.preventDefault();
      drop.classList.add('is-over');
    }));
  ['dragleave', 'drop'].forEach(type =>
    drop.addEventListener(type, e => {
      e.preventDefault();
      drop.classList.remove('is-over');
    }));
  drop.addEventListener('drop', e => choose(e.dataTransfer.files[0]));

  /* ───────────────────────────── upload */

  $('#uploadBtn').addEventListener('click', async () => {
    if (!picked) return;
    const button = $('#uploadBtn');
    const bar = $('#progress');
    const fill = $('#progressFill');
    const text = $('#progressText');

    button.disabled = true;
    bar.hidden = false;
    fill.style.width = '0%';
    text.textContent = 'Preparando…';
    say('');

    try {
      const { uploadId, chunkSize, chunks } = await api('/api/admin/upload/init', {
        method: 'POST',
        body: { name: picked.name, type: picked.type, size: picked.size },
      });

      for (let i = 0; i < chunks; i++) {
        // The third argument matters: Blob.slice() otherwise produces a blob
        // with an empty type, the request goes out with no content-type, and
        // the function reads a zero-length body.
        const slice = picked.slice(i * chunkSize, (i + 1) * chunkSize, 'application/octet-stream');
        await api(`/api/admin/upload/chunk?id=${uploadId}&i=${i}`, {
          method: 'POST',
          body: slice,
          raw: true,
        });
        const pct = Math.round(((i + 1) / chunks) * 100);
        fill.style.width = pct + '%';
        text.textContent = `${pct}% · parte ${i + 1} de ${chunks}`;
      }

      text.textContent = 'Juntando as partes…';
      await api('/api/admin/upload/finish', { method: 'POST', body: { uploadId } });

      text.textContent = 'Pronto';
      say('Reel publicado. A página recarregada já mostra o novo vídeo.');
      picked = null;
      input.value = '';
      drop.classList.remove('is-set');
      $('#dropText').textContent = 'Arraste um vídeo aqui, ou clique para escolher';
      await refresh();
    } catch (err) {
      say(err.message, true);
      button.disabled = false;
    } finally {
      setTimeout(() => { bar.hidden = true; }, 1600);
    }
  });

  /* ───────────────────────────── url + reset */

  $('#urlBtn').addEventListener('click', async () => {
    const url = $('#url').value.trim();
    if (!url) {
      say('Cole a URL do vídeo primeiro.', true);
      return;
    }
    const button = $('#urlBtn');
    button.disabled = true;
    try {
      await api('/api/admin/reel/url', { method: 'POST', body: { url } });
      $('#url').value = '';
      say('O reel agora aponta para essa URL.');
      await refresh();
    } catch (err) {
      say(err.message, true);
    } finally {
      button.disabled = false;
    }
  });

  $('#resetBtn').addEventListener('click', async () => {
    if (!confirm('Limpar o reel e voltar para o vídeo padrão do pacote?')) return;
    try {
      await api('/api/admin/reel/reset', { method: 'POST' });
      say('Reel redefinido.');
      await refresh();
    } catch (err) {
      say(err.message, true);
    }
  });

  /* ───────────────────────────── funnel

     Absolute counts plus the step-to-step rate, because the rate is what tells
     you where people leave. A step with nothing above it shows "—", not 0%:
     no traffic and no conversion look identical in a percentage and are
     completely different problems. */

  const STEP_LABELS = {
    PageView: 'Visitas',
    ViewContent: 'Página de produto',
    InitiateCheckout: 'Checkout iniciado',
    Lead: 'Leads',
    Purchase: 'Compras',
  };

  const pct = value => (value === null ? '—' : (value * 100).toFixed(1) + '%');

  async function loadFunnel() {
    const days = $('#funnelDays').value;
    try {
      const { totals, rates } = await api(`/api/admin/funnel?days=${days}`);
      const order = Object.keys(STEP_LABELS);
      const top = totals[order[0]] || 0;

      $('#funnelSteps').innerHTML = order.map((step, i) => {
        const count = totals[step] || 0;
        // Bar width is share of the top of the funnel, so the drop-off is the
        // shape of the chart rather than something you have to compute.
        const width = top ? Math.max((count / top) * 100, count ? 2 : 0) : 0;
        const prev = i ? totals[order[i - 1]] || 0 : null;
        const step_rate = i === 0 ? null : prev ? count / prev : null;
        return `
          <div class="ad-step">
            <div class="ad-step__row">
              <span class="ad-step__name">${STEP_LABELS[step]}</span>
              <span class="ad-step__n mono">${count.toLocaleString('pt-BR')}</span>
              <span class="ad-step__pct mono">${i === 0 ? '' : pct(step_rate)}</span>
            </div>
            <div class="ad-step__bar"><span style="width:${width}%"></span></div>
          </div>`;
      }).join('');

      $('#funnelNote').textContent =
        `visita → produto ${pct(rates.view_to_product)} · ` +
        `produto → checkout ${pct(rates.product_to_checkout)} · ` +
        `geral ${pct(rates.overall)}`;
    } catch (err) {
      $('#funnelSteps').innerHTML = '';
      say(err.message, true, $('#funnelNote'));
    }
  }

  $('#funnelDays').addEventListener('change', loadFunnel);

  /* ───────────────────────────── boot */

  if (token) showConsole();
})();
