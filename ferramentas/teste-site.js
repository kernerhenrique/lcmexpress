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
  // centro autorizado FedEx
  ok(await p.isVisible('.selo-fedex') && (await p.innerText('.selo-fedex')).toUpperCase().includes('CENTRO AUTORIZADO FEDEX'), 'selo de centro autorizado FedEx no topo');
  ok(await p.locator('#fedex h2').count() === 1 && (await p.innerText('.rod-copy')).includes('marca registrada da Federal Express'), 'seção FedEx e aviso de marca no rodapé');
  ok(await p.locator('img[src*="fedex" i], img[alt*="fedex" i]').count() === 0, 'sem logo da FedEx (só texto)');
  // globo gira e troca de destino
  ok(await p.isVisible('#globo') && await p.isVisible('#globo-pausa'), 'globo em canvas com botão Pausar');
  const d1 = await p.textContent('#globo-dest'); await p.waitForTimeout(8500); const d2 = await p.textContent('#globo-dest');
  ok(d1 !== d2, 'globo troca de destino sozinho (' + d1 + ' → ' + d2 + ')');
  await p.click('#globo-pausa'); const d3 = await p.textContent('#globo-dest'); const px1 = await p.locator('#globo').screenshot(); await p.waitForTimeout(1500); const px2 = await p.locator('#globo').screenshot();
  ok(px1.equals(px2) && (await p.getAttribute('#globo-pausa', 'aria-pressed')) === 'true', 'Pausar congela o globo');
  await p.click('#globo-pausa');
  ok((await p.innerText('#proc-titulo')).includes('A LCM cuida de todo o resto') && await p.locator('.faz li').count() === 6, 'seção "a LCM cuida de tudo" com 6 itens');
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
  ok(await p.locator('.campo.invalido').count() === 3, 'documentos sem país, cidade e nome: 3 avisos');
  ok(await p.isHidden('#c-cont'), 'campo do conteúdo escondido em Documentos');
  await p.check('input[name=tipo][value="Encomenda ou amostra"]', { force: true });
  ok(await p.isVisible('#c-cont'), 'campo do conteúdo aparece em Encomenda');
  await p.fill('#c-pais', 'Portugal'); await p.fill('#c-nome', 'Ana Teste');
  await p.click('#cotacao button[type=submit]');
  ok(await p.locator('.campo.invalido').count() === 2 && await p.evaluate(() => document.activeElement.id === 'c-cont'), 'encomenda sem conteúdo e sem cidade: 2 avisos, foco no conteúdo');
  await p.fill('#c-cont', 'Amostras de granito'); await p.fill('#c-cidade', 'Lisboa');
  await p.fill('#c-qtd', '2'); await p.fill('#c-peso', '3'); await p.fill('#c-c', '50'); await p.fill('#c-l', '40'); await p.fill('#c-a', '30');
  ok((await p.innerText('#r-cub')) === '24,0 kg', 'peso cubado: 2 × (50×40×30 ÷ 5.000) = 24 kg (' + await p.innerText('#r-cub') + ')');
  ok((await p.innerText('#r-real')) === '6,00 kg', 'peso real: 2 × 3 = 6 kg');
  ok((await p.innerText('#r-cons')) === '24,0 kg', 'peso considerado é o maior (24 kg)');
  ok((await p.innerText('#r-dest')) === 'Lisboa, Portugal', 'destino no resumo');
  await p.fill('#c-emp', 'Empresa X');
  let url = '';
  await ctx.route('https://wa.me/**', r => { url = decodeURIComponent(r.request().url()); r.fulfill({ body: 'ok', contentType: 'text/plain' }); });
  const [pop] = await Promise.all([ctx.waitForEvent('page'), p.click('#cotacao button[type=submit]')]);
  await pop.waitForLoadState(); await pop.close();
  ok(url.includes('5527999610409') && url.includes('Portugal') && url.includes('24,0 kg') && url.includes('Ana Teste') && url.includes('Conteúdo:* Amostras de granito'), 'WhatsApp abre com os dados da cotação, incluindo o conteúdo');
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
  ok(await r.isHidden('.globo-leg') && await r.isVisible('#globo'), 'movimento reduzido: globo parado, sem legenda nem pausa');
  ok(await r.locator('#contato .rv').first().evaluate(e => getComputedStyle(e).opacity) === '1', 'movimento reduzido: blocos visíveis');
  const sj = await b.newContext({ javaScriptEnabled: false }); const s = await sj.newPage();
  await s.goto(BASE + '/');
  ok(await s.locator('#contato .contatos').evaluate(e => getComputedStyle(e).opacity) === '1' && await s.isVisible('#pn-doc'), 'sem JS: conteúdo visível');
  await b.close();
  console.log('falhas: ' + falhas); process.exit(falhas ? 1 : 0);
})();
