// Abre o Radar em modo sandbox: só GET para o próprio domínio.
// Qualquer POST, PUT ou host externo (HubSpot, GTM, fontes) é bloqueado.
// Uso: node scripts/sandbox-radar.js [pasta-de-saida]
const { chromium } = require('playwright');
const fs = require('fs');

const ORIGIN = 'https://radar.deltaacademy.com.br';
const OUT = process.argv[2] || 'evidence/screens';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const bloqueados = [];
  let liberados = 0;

  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() !== 'GET' || url.origin !== ORIGIN) {
      bloqueados.push(`${req.method()} ${url.origin}${url.pathname}`);
      return route.abort('blockedbyclient');
    }
    liberados++;
    return route.continue();
  });

  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/?flow=quiz-first#/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/01-inicio.png` });

  await page.goto(`${ORIGIN}/?flow=quiz-first#/quiz/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/02-pergunta-1.png` });

  await browser.close();

  const posts = bloqueados.filter((b) => !b.startsWith('GET ')).length;
  console.log(`GET liberados (mesmo domínio): ${liberados}`);
  console.log(`Bloqueados: ${bloqueados.length}`);
  bloqueados.forEach((b) => console.log(`  - ${b}`));
  console.log(`Tentativas de envio (POST/PUT etc.): ${posts}`);
  console.log(`Capturas em: ${OUT}`);
})();
