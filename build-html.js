const fs = require('fs');

const css = fs.readFileSync('styles.css', 'utf8');
const data = fs.readFileSync('quiz-data.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#ffffff">
  <title>IA Influencer | Eduardo Rodrigues</title>
  <meta name="description" content="Faça de R$500 a R$1.000 por dia com vídeos de IA sem aparecer.">
  <style>${css}</style>
</head>
<body>
  <div class="progress-shell" aria-hidden="true"><div id="progress" class="progress"></div></div>
  <main id="app" class="app" aria-live="polite"></main>
  <script>${data}<\/script>
  <script>${app}<\/script>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log(`index.html: ${Buffer.byteLength(html)} bytes`);
