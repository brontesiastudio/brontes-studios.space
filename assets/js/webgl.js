/* ═══════════════════════════════════════════════════════════════
   BRONTES — background field
   One fullscreen quad, raw WebGL, no library. Replaces the flat page
   gradient the original had. If the context is unavailable the canvas
   stays at opacity 0 and the CSS gradient underneath is what shows,
   so nothing depends on this running.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const canvas = document.getElementById('gl-bg');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gl =
    canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
    canvas.getContext('experimental-webgl');
  if (!gl) return;

  const VERT = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }
  `;

  const FRAG = `
    precision mediump float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform float u_scroll;

    // Value noise + fbm. Cheap enough to run fullscreen on a phone.
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 st = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

      float t = u_time * 0.028;

      // Slow domain-warped field, drifting with scroll.
      vec2 q = vec2(fbm(st * 1.6 + t), fbm(st * 1.6 + vec2(3.2, 1.7) - t));
      float f = fbm(st * 2.1 + q * 1.35 + vec2(0.0, u_scroll * 0.35));

      // Aperture-shaped falloff: a soft iris centred on the viewport that
      // opens a little toward the pointer.
      vec2 c = st - u_mouse * 0.10;
      float r = length(c);
      float iris = smoothstep(0.95, 0.05, r);

      // Bronze lifted out of near-black. Deliberately narrow so the field
      // reads as texture, never as a coloured background.
      vec3 ink    = vec3(0.020, 0.020, 0.023);
      vec3 lift   = vec3(0.075, 0.070, 0.078);
      vec3 bronze = vec3(0.788, 0.635, 0.478);

      vec3 col = mix(ink, lift, f * iris * 1.25);
      col += bronze * pow(f, 3.4) * iris * 0.30;

      // Vignette, then grain so the gradient never bands on a dark panel.
      col *= 1.0 - 0.55 * smoothstep(0.35, 1.25, length(st));
      float grain = hash(gl_FragCoord.xy + fract(u_time) * 100.0);
      col += (grain - 0.5) * 0.030;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[gl]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[gl]', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  // Half resolution: the field is all low-frequency, and this keeps a
  // fullscreen fragment shader cheap on phones.
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
  const resize = () => {
    // CSS owns the element's size; only the drawing buffer is set here, from
    // the box the browser actually gave us rather than from innerHeight.
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    canvas.width = Math.max(1, Math.floor(w * DPR));
    canvas.height = Math.max(1, Math.floor(h * DPR));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  addEventListener('orientationchange', resize, { passive: true });
  // Mobile toolbars change the visual viewport without firing a window resize.
  visualViewport?.addEventListener('resize', resize, { passive: true });

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth) * 2 - 1;
    ty = 1 - (e.clientY / innerHeight) * 2;
  }, { passive: true });

  let scroll = 0;
  addEventListener('scroll', () => {
    const max = document.body.scrollHeight - innerHeight;
    scroll = max > 0 ? scrollY / max : 0;
  }, { passive: true });

  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  const start = performance.now();
  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);

  canvas.classList.add('ready');
})();
