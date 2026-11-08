/* Teste do site da LCM Express (Playwright).
   Uso: na raiz do site, `npx serve -l 8793 .` e depois `node ferramentas/teste-site.js` (ou BASE=<endereço> node ...). */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8793';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok    ' : 'FALHA ') + m); if (!c) falhas++; };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage(); const erros = [], fora = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', e => erros.push(String(e)));
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1', 'lcmexpressvix.com.br', 'wa.me'].includes(u.hostname) && !u.hostname.endsWith('.vercel.app') && u.protocol !== 'data:') fora.push(r.url()); });
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });

  ok((await p.title()).includes('LCM Express'), 'título da página');
  ok(await p.locator('h1').count() === 1, 'um único h1');
  ok(await p.locator('.rota').count() === 4, 'globo com 4 rotas');
  ok(await p.locator('#depoimentos, .depoimentos').count() === 0, 'sem depoimentos');

  // abas dos serviços (clique e teclado)
  await p.click('#ab-enc');
  ok(await p.isVisible('#pn-enc') && await p.isHidden('#pn-doc'), 'aba Encomendas abre o painel certo');
  await p.focus('#ab-enc'); await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.id === 'ab-car') && await p.isVisible('#pn-car'), 'seta para baixo vai para Cargas');

  // números contam até o valor
  await p.locator('.numeros').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  ok((await p.locator('[data-ate="10000"]').innerText()) === '10.000', 'contador de envios termina em 10.000');

  // etapas acendem com a rolagem
  await p.locator('#etapas').scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, 300)); await p.waitForTimeout(300);
  ok(await p.locator('.etapa.feita').count() === 4, 'as 4 etapas acendem');

  // cotação
  ok(await p.locator('#paises option').count() > 190, 'lista com mais de 190 países (' + await p.locator('#paises option').count() + ')');
  ok(await p.locator('#paises option[value="Brasil"]').count() === 0, 'Brasil fora da lista de destinos');
  await p.click('#cotacao button[type=submit]');
  ok(await p.locator('.campo.invalido').count() === 2, 'sem país e nome: 2 avisos de campo obrigatório');
  await p.check('input[name=tipo][value="Encomenda ou amostra"]', { force: true });
  await p.fill('#c-pais', 'Portugal'); await p.fill('#c-cidade', 'Lisboa');
  await p.fill('#c-qtd', '2'); await p.fill('#c-peso', '3'); await p.fill('#c-c', '50'); await p.fill('#c-l', '40'); await p.fill('#c-a', '30');
  ok((await p.innerText('#r-cub')) === '24,0 kg', 'peso cubado: 2 × (50×40×30 ÷ 5.000) = 24 kg (' + await p.innerText('#r-cub') + ')');
  ok((await p.innerText('#r-real')) === '6,00 kg', 'peso real: 2 × 3 = 6 kg');
  ok((await p.innerText('#r-cons')) === '24,0 kg', 'peso considerado é o maior (24 kg)');
  ok((await p.innerText('#r-dest')) === 'Lisboa, Portugal', 'destino no resumo');
  await p.fill('#c-nome', 'Ana Teste'); await p.fill('#c-emp', 'Empresa X');
  let url = '';
  await ctx.route('https://wa.me/**', r => { url = decodeURIComponent(r.request().url()); r.fulfill({ body: 'ok', contentType: 'text/plain' }); });
  const [pop] = await Promise.all([ctx.waitForEvent('page'), p.click('#cotacao button[type=submit]')]);
  await pop.waitForLoadState(); await pop.close();
  ok(url.includes('5527999610409') && url.includes('Portugal') && url.includes('24,0 kg') && url.includes('Ana Teste'), 'WhatsApp abre com os dados da cotação');
  ok(decodeURIComponent(await p.getAttribute('#cot-mail', 'href')).includes('Lisboa, Portugal'), 'link de e-mail leva os mesmos dados');

  // dúvidas
  await p.click('#duvidas details:nth-of-type(2) summary');
  ok(await p.locator('#duvidas details:nth-of-type(2)').evaluate(d => d.open), 'pergunta abre ao clicar');

  ok(await p.locator('.zap-fixo').isVisible(), 'botão fixo de WhatsApp');
  ok(erros.length === 0, 'console limpo ' + erros.join(' | '));
  ok(fora.length === 0, 'nada carregado de fora ' + fora.join(' '));

  // celular
  for (const w of [360, 375]) {
    const m = await b.newPage({ viewport: { width: w, height: 800 } });
    await m.goto(BASE + '/', { waitUntil: 'networkidle' });
    ok(await m.evaluate(() => document.documentElement.scrollWidth) <= w, 'sem rolagem lateral em ' + w + ' px');
    if (w === 375) {
      await m.click('.menu-btn'); ok(await m.isVisible('#nav a[href="#contato"]'), 'menu do celular abre');
      await m.click('#nav a[href="#contato"]'); await m.waitForTimeout(600); ok(await m.isHidden('#nav a[href="#contato"]'), 'menu fecha ao escolher');
    }
    await m.close();
  }
  // movimento reduzido e sem JS
  const r = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await r.goto(BASE + '/'); await r.waitForTimeout(200);
  ok(await r.locator('.rota').first().evaluate(e => getComputedStyle(e).strokeDashoffset) === '0px' || await r.locator('.rota').first().evaluate(e => getComputedStyle(e).strokeDashoffset === '0'), 'movimento reduzido: rotas já desenhadas');
  ok(await r.locator('#contato .rv').first().evaluate(e => getComputedStyle(e).opacity) === '1', 'movimento reduzido: blocos visíveis');
  const sj = await b.newContext({ javaScriptEnabled: false }); const s = await sj.newPage();
  await s.goto(BASE + '/');
  ok(await s.locator('#contato .contatos').evaluate(e => getComputedStyle(e).opacity) === '1' && await s.isVisible('#pn-doc'), 'sem JS: conteúdo visível');
  await b.close();
  console.log('falhas: ' + falhas); process.exit(falhas ? 1 : 0);
})();
