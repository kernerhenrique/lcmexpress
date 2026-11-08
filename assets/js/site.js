/* LCM Express · comportamento do site (sem dependências). */
(function () {
  'use strict';
  var WHATSAPP = '5527999610409';   // número da LCM, só dígitos, com DDI 55
  var EMAIL = 'lcmvix@lcmexpressvix.com.br';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var num = function (v, casas) { return v.toLocaleString('pt-BR', { minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0 }); };

  /* cabeçalho: sombra ao rolar e menu do celular */
  var topo = $('#topo'), nav = $('#nav'), menu = $('.menu-btn');
  var marcaRolagem = function () { topo.classList.toggle('rolou', scrollY > 8); };
  addEventListener('scroll', marcaRolagem, { passive: true }); marcaRolagem();
  function fechaMenu() { nav.classList.remove('aberto'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); menu.querySelector('use').setAttribute('href', '#i-menu'); }
  menu.addEventListener('click', function () {
    var abre = !nav.classList.contains('aberto');
    nav.classList.toggle('aberto', abre); menu.setAttribute('aria-expanded', String(abre)); menu.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
    menu.querySelector('use').setAttribute('href', abre ? '#i-x' : '#i-menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) { fechaMenu(); menu.focus(); } });

  /* entrada discreta dos blocos */
  var blocos = $$('.rv');
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    blocos.forEach(function (b) { io.observe(b); });
  } else blocos.forEach(function (b) { b.classList.add('in'); });

  /* números contam uma vez */
  var conts = $$('[data-ate]');
  function conta(el) {
    var alvo = +el.dataset.ate, t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); el.textContent = num(Math.round(alvo * e)); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  if ('IntersectionObserver' in window && !reduz) {
    var io2 = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { conta(en.target); io2.unobserve(en.target); } }); }, { threshold: .6 });
    conts.forEach(function (c) { io2.observe(c); });
  }

  /* abas dos serviços */
  var abas = $$('.abas [role=tab]');
  function escolhe(b, foco) {
    abas.forEach(function (x) { var s = x === b; x.setAttribute('aria-selected', String(s)); x.tabIndex = s ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !s; });
    if (foco) b.focus();
  }
  abas.forEach(function (b, i) {
    b.addEventListener('click', function () { escolhe(b); });
    b.addEventListener('keydown', function (e) {
      var k = e.key, n = (k === 'ArrowDown' || k === 'ArrowRight') ? i + 1 : (k === 'ArrowUp' || k === 'ArrowLeft') ? i - 1 : k === 'Home' ? 0 : k === 'End' ? abas.length - 1 : null;
      if (n === null) return; e.preventDefault(); escolhe(abas[(n + abas.length) % abas.length], true);
    });
  });

  /* etapas acendem conforme a rolagem */
  var etapas = $$('.etapa'), lista = $('#etapas');
  function acende() {
    if (reduz) { etapas.forEach(function (e) { e.classList.add('feita'); }); return; }
    var alvo = innerHeight * .7;
    etapas.forEach(function (e) { e.classList.toggle('feita', e.getBoundingClientRect().top < alvo); });
  }
  if (lista) { addEventListener('scroll', acende, { passive: true }); acende(); }

  /* cotação */
  var form = $('#cot');
  if (form) (function () {
    var PAISES = 'AF ZA AL DE AD AO AG SA DZ AR AM AW AU AT AZ BS BH BD BB BE BZ BJ BM BY BO BA BW BN BG BF BI BT CV CM KH CA QA KZ TD CL CN CY CO KM CG CD KP KR CI CR HR CU CW DK DJ DM EG SV AE EC ER SK SI ES US EE SZ ET FJ PH FI FR GA GM GH GE GI GD GR GL GP GU GT GY GF GN GQ GW HT HN HK HU YE KY FO MP MH SB TC VG VI IN ID IR IQ IE IS IL IT JM JP JO XK KW LA LS LV LB LR LY LI LT LU MO MK MG MY MW MV ML MT MA MQ MU MR YT MX MM FM MZ MD MC MN ME MS NA NR NP NI NE NG NO NC NZ OM NL PW PS PA PG PK PY PE PF PL PR PT KE KG GB CF CZ DO RE RO RW RU WS AS SM LC SN SL RS SC SG SY SO LK ST SD SS SE CH SR TH TW TJ TZ TL TG TO TT TN TM TR TV UA UG UY UZ VU VA VE VN WF ZM ZW KN VC BQ SX MF BL';
    var nomes = [];
    try { var dn = new Intl.DisplayNames(['pt-BR'], { type: 'region' }); nomes = PAISES.split(' ').map(function (c) { return dn.of(c); }); } catch (e) { nomes = []; }
    nomes = nomes.filter(function (n, i) { return n && nomes.indexOf(n) === i; }).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
    $('#paises').innerHTML = nomes.map(function (n) { return '<option value="' + n + '">'; }).join('');

    var v = function (id) { var x = $('#' + id).value.trim().replace(',', '.'); return x === '' ? NaN : +x; };
    var kg = function (x) { return num(x, x < 10 ? 2 : 1) + ' kg'; };
    function calcula() {
      var tipo = form.tipo.value, qtd = Math.max(1, Math.round(v('c-qtd')) || 1), peso = v('c-peso'), c = v('c-c'), l = v('c-l'), a = v('c-a');
      var cub = (c > 0 && l > 0 && a > 0) ? c * l * a / 5000 : NaN;
      var pais = $('#c-pais').value.trim(), cidade = $('#c-cidade').value.trim();
      var cont = $('#c-cont').value.trim(), pedeCont = tipo !== 'Documentos';
      form.dataset.tipo = tipo;
      $('#r-tipo').textContent = tipo;
      $('#r-cont-l').hidden = !pedeCont; $('#r-cont').textContent = cont || '—';
      $('#r-dest').textContent = pais ? (cidade ? cidade + ', ' + pais : pais) : '—';
      $('#r-qtd').textContent = qtd;
      $('#r-real').textContent = peso > 0 ? kg(peso * qtd) : '—';
      $('#r-cub').textContent = cub > 0 ? kg(cub * qtd) : '—';
      var cons = Math.max(peso > 0 ? peso : 0, cub > 0 ? cub : 0) * qtd;
      $('#r-cons').textContent = cons > 0 ? kg(cons) : '—';
      return { tipo: tipo, cont: pedeCont ? cont : '', qtd: qtd, peso: peso, c: c, l: l, a: a, cub: cub, cons: cons, pais: pais, cidade: cidade };
    }
    function mensagem(d) {
      var L = ['Olá, LCM Express! Gostaria de uma cotação de envio.', '', '*Tipo:* ' + d.tipo];
      if (d.cont) L.push('*Conteúdo:* ' + d.cont);
      L.push('*Destino:* ' + (d.cidade ? d.cidade + ', ' : '') + d.pais, '*Volumes:* ' + d.qtd);
      if (d.peso > 0) L.push('*Peso por volume:* ' + kg(d.peso));
      if (d.cub > 0) L.push('*Medidas por volume:* ' + num(d.c) + ' × ' + num(d.l) + ' × ' + num(d.a) + ' cm', '*Peso cubado total:* ' + kg(d.cub * d.qtd));
      if (d.cons > 0) L.push('*Peso considerado:* ' + kg(d.cons));
      var obs = $('#c-obs').value.trim(), emp = $('#c-emp').value.trim();
      if (obs) L.push('*Observações:* ' + obs);
      L.push('', '*Nome:* ' + $('#c-nome').value.trim() + (emp ? ' · ' + emp : ''));
      return L.join('\n');
    }
    function atualizaMail() { var d = calcula(); $('#cot-mail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Cotação de envio' + (d.pais ? ' · ' + d.pais : '')) + '&body=' + encodeURIComponent(mensagem(d).replace(/\*/g, '')); }
    form.addEventListener('input', function (e) { var c = e.target.closest('.campo'); if (c) c.classList.remove('invalido'); atualizaMail(); });
    form.addEventListener('change', atualizaMail);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var faltam = [];
      var obrig = [['c-cont', 'e-cont'], ['c-pais', 'e-pais'], ['c-cidade', 'e-cidade'], ['c-nome', 'e-nome']];
      if (form.tipo.value === 'Documentos') { obrig.shift(); $('#campo-conteudo').classList.remove('invalido'); }
      obrig.forEach(function (p) { var i = $('#' + p[0]); if (!i.value.trim()) { i.closest('.campo').classList.add('invalido'); i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', p[1]); faltam.push(i); } else i.removeAttribute('aria-invalid'); });
      if (faltam.length) { faltam[0].focus(); return; }
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem(calcula()));
      window.open(url, '_blank', 'noopener');
    });
    calcula(); atualizaMail();
  })();


  /* globo do topo: gira até cada destino e desenha a rota a partir de Vitória */
  var cv = $('#globo');
  if (cv && cv.getContext && window.LCM_TERRA) (function () {
    var ctx = cv.getContext('2d'), T = window.LCM_TERRA, N = T.length / 2, RAD = Math.PI / 180;
    var COR = '#085D87', TINTA = '#10222F';
    var VIX = [-40.29, -20.32];
    var DEST = [['Miami', -80.19, 25.76], ['Lisboa', -9.14, 38.72], ['Santiago', -70.67, -33.45], ['Londres', -0.13, 51.51], ['Joanesburgo', 28.05, -26.2], ['Nova York', -74.0, 40.71], ['Buenos Aires', -58.38, -34.6], ['Frankfurt', 8.68, 50.11], ['Cidade do México', -99.13, 19.43], ['Dubai', 55.27, 25.2], ['Toronto', -79.38, 43.65], ['Tóquio', 139.69, 35.69]];
    // pontos de terra em 3D (calculados uma vez)
    var P = new Float32Array(N * 3);
    for (var k = 0; k < N; k++) { var lo = T[2 * k] / 10 * RAD, la = T[2 * k + 1] / 10 * RAD; P[3 * k] = Math.cos(la) * Math.cos(lo); P[3 * k + 1] = Math.cos(la) * Math.sin(lo); P[3 * k + 2] = Math.sin(la); }
    var v3 = function (ll) { var lo = ll[0] * RAD, la = ll[1] * RAD; return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; };
    var slerp = function (a, b, t) { var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d); if (w < 1e-6) return a.slice(); var s = Math.sin(w), x = Math.sin((1 - t) * w) / s, y = Math.sin(t * w) / s; return [x * a[0] + y * b[0], x * a[1] + y * b[1], x * a[2] + y * b[2]]; };
    var vVix = v3(VIX), alvos = DEST.map(function (d) { return v3([d[1], d[2]]); });
    var W = 0, R = 0, C = 0, dpr = 1;
    function medida() { var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = Math.max(200, Math.round(r.width)); cv.width = W * dpr; cv.height = W * dpr; R = W * 0.47; C = W / 2; }
    // projeção ortográfica com o centro em "cen" (vetor 3D), norte para cima
    var cen, eE, eN;
    function centro(v) {
      cen = v; var z = [0, 0, 1], e = [z[1] * v[2] - z[2] * v[1], z[2] * v[0] - z[0] * v[2], z[0] * v[1] - z[1] * v[0]], m = Math.hypot(e[0], e[1], e[2]) || 1;
      eE = [e[0] / m, e[1] / m, e[2] / m]; eN = [v[1] * eE[2] - v[2] * eE[1], v[2] * eE[0] - v[0] * eE[2], v[0] * eE[1] - v[1] * eE[0]];
    }
    function proj(x, y, z, alt) { return [C + R * alt * (x * eE[0] + y * eE[1] + z * eE[2]), C - R * alt * (x * eN[0] + y * eN[1] + z * eN[2]), x * cen[0] + y * cen[1] + z * cen[2]]; }
    function rotaPts(b) { var w = Math.acos(Math.max(-1, Math.min(1, vVix[0] * b[0] + vVix[1] * b[1] + vVix[2] * b[2]))), out = []; for (var i = 0; i <= 64; i++) { var t = i / 64, v = slerp(vVix, b, t); out.push([v, 1 + 0.2 * Math.sin(Math.PI * t) * Math.min(1, w / 1.2)]); } return out; }
    var rotas = alvos.map(rotaPts);
    // ponto de vista um pouco ao lado da rota (para o sul), senão a rota aparece como uma linha reta
    var norm = function (v) { var m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; };
    function vista(i, frac) {
      var a = alvos[i], c = slerp(vVix, a, frac), n = norm([vVix[1] * a[2] - vVix[2] * a[1], vVix[2] * a[0] - vVix[0] * a[2], vVix[0] * a[1] - vVix[1] * a[0]]);
      if (n[2] > 0) n = [-n[0], -n[1], -n[2]];
      return norm([c[0] + .32 * n[0], c[1] + .32 * n[1], c[2] + .32 * n[2]]);
    }
    function ponto(v, raio, cor, nome, alfa, dir) {
      var p = proj(v[0], v[1], v[2], 1); if (p[2] < 0.05) return;
      ctx.globalAlpha = alfa; ctx.fillStyle = '#fff'; ctx.strokeStyle = cor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p[0], p[1], raio, 0, 7); ctx.fill(); ctx.stroke();
      if (nome) {
        ctx.font = '600 13px "Source Sans 3", Arial, sans-serif'; ctx.textBaseline = 'middle';
        var tw = ctx.measureText(nome).width, fora = p[0] + 10 + tw > W - 4, x = fora ? p[0] - 10 - tw : p[0] + 10;
        ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.strokeText(nome, x, p[1] - (dir || 0)); ctx.fillStyle = TINTA; ctx.fillText(nome, x, p[1] - (dir || 0));
      }
      ctx.globalAlpha = 1;
    }
    function desenha(rotaIdx, prog, alfa, todas) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, W);
      var g = ctx.createRadialGradient(C - R * .3, C - R * .35, R * .1, C, C, R);
      g.addColorStop(0, 'rgba(13,106,152,.16)'); g.addColorStop(1, 'rgba(8,93,135,.02)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C, C, R, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(8,93,135,.22)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(8,93,135,.55)'; ctx.beginPath();
      var esc = W / 520;
      for (var k = 0; k < N; k++) {
        var p = proj(P[3 * k], P[3 * k + 1], P[3 * k + 2], 1);
        if (p[2] > 0.06) { var r = (1.05 + .75 * p[2]) * esc; ctx.moveTo(p[0] + r, p[1]); ctx.arc(p[0], p[1], r, 0, 6.2832); }
      }
      ctx.fill();
      // as rotas já feitas ficam na tela até o ciclo recomeçar; só a atual leva o nome do destino
      var lista = todas ? rotas.map(function (_, i) { return i; }) : rotas.slice(0, rotaIdx + 1).map(function (_, i) { return i; });
      // as rotas ficam dentro do contorno do globo (as já feitas, vistas de lado, não saem para fora)
      ctx.save(); ctx.beginPath(); ctx.arc(C, C, R + 1, 0, 7); ctx.clip();
      var nomes = [];
      lista.forEach(function (i) {
        var atual = !todas && i === rotaIdx, pts = rotas[i], fim = atual ? prog : 1, n = Math.floor(fim * (pts.length - 1));
        ctx.globalAlpha = todas ? 1 : alfa; ctx.strokeStyle = COR; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
        var ab = false;
        for (var j = 0; j <= n; j++) {
          var v = pts[j][0], q = proj(v[0], v[1], v[2], pts[j][1]), vis = proj(v[0], v[1], v[2], 1)[2] > 0.02;
          if (vis) { if (ab) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); ab = true; } } else ab = false;
        }
        ctx.stroke(); ctx.globalAlpha = 1;
        if (fim >= 1) nomes.push(i);
      });
      ctx.restore();
      // pontos e nomes depois do recorte, para o nome não ser cortado na borda
      nomes.forEach(function (i) { var atual = !todas && i === rotaIdx; ponto(alvos[i], atual || todas ? 3.4 : 2.8, COR, atual || todas ? DEST[i][0] : '', todas ? 1 : alfa, 9); });
      // Vitória
      var o = proj(vVix[0], vVix[1], vVix[2], 1);
      if (o[2] > 0.05) {
        ctx.fillStyle = 'rgba(99,161,227,.3)'; ctx.beginPath(); ctx.arc(o[0], o[1], 9, 0, 7); ctx.fill();
        ctx.fillStyle = COR; ctx.beginPath(); ctx.arc(o[0], o[1], 4.4, 0, 7); ctx.fill();
        ctx.font = '600 13px "Source Sans 3", Arial, sans-serif'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round';
        ctx.strokeText('Vitória', o[0] + 10, o[1] + 14); ctx.fillStyle = TINTA; ctx.fillText('Vitória', o[0] + 10, o[1] + 14);
      }
    }
    var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    var leg = $('.globo-leg'), nomeDest = $('#globo-dest'), btn = $('#globo-pausa');
    var GIRA = 1000, TRACA = 800, MOSTRA = 800, SOME = 450;
    var idx = 0, t0 = 0, pausado = false, visivel = true, raf = 0, de = null, quadroAtual = { i: 0, prog: 1, alfa: 1 };
    medida();
    if (reduz) { centro(slerp(vVix, v3([-20, 15]), .5)); desenha(0, 1, 1, true); addEventListener('resize', function () { medida(); desenha(0, 1, 1, true); }); return; }
    leg.hidden = false;
    function quadro(agora) {
      var e = agora - t0, i = idx, prog = 0, alfa = 1, cenV, ultimo = i === alvos.length - 1, CICLO = GIRA + TRACA + MOSTRA + (ultimo ? SOME : 0);
      var inicio = vista(i, .3), fim = vista(i, .55);
      if (e < GIRA) { cenV = slerp(de, inicio, ease(e / GIRA)); }
      else if (e < GIRA + TRACA) { var u = (e - GIRA) / TRACA; prog = ease(u); cenV = slerp(inicio, fim, ease(u)); if (nomeDest.textContent !== DEST[i][0]) nomeDest.textContent = DEST[i][0]; }
      else if (e < GIRA + TRACA + MOSTRA) { prog = 1; cenV = fim; }
      else if (e < CICLO) { prog = 1; alfa = 1 - (e - GIRA - TRACA - MOSTRA) / SOME; cenV = fim; }   // só depois do último destino: todas as rotas somem juntas
      else { de = fim; idx = (idx + 1) % alvos.length; t0 = agora; raf = requestAnimationFrame(quadro); return; }
      centro(cenV); desenha(i, prog, alfa); quadroAtual = { i: i, prog: prog, alfa: alfa, cen: cenV };
      raf = requestAnimationFrame(quadro);
    }
    var pausaEm = 0;
    function para() { if (raf) { cancelAnimationFrame(raf); raf = 0; pausaEm = performance.now(); } }
    function segue() { if (raf || pausado || !visivel || document.hidden) return; t0 += pausaEm ? performance.now() - pausaEm : 0; pausaEm = 0; raf = requestAnimationFrame(quadro); }
    btn.addEventListener('click', function () {
      pausado = !pausado; btn.setAttribute('aria-pressed', String(pausado));
      btn.querySelector('use').setAttribute('href', pausado ? '#i-play' : '#i-pausa'); btn.querySelector('span').textContent = pausado ? 'Continuar' : 'Pausar';
      if (pausado) para(); else segue();
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visivel = en[0].isIntersecting; if (visivel) segue(); else para(); }).observe(cv);
    document.addEventListener('visibilitychange', function () { if (document.hidden) para(); else segue(); });
    addEventListener('resize', function () { medida(); if (quadroAtual.cen) { centro(quadroAtual.cen); desenha(quadroAtual.i, quadroAtual.prog, quadroAtual.alfa); } });
    de = vista(0, .3); centro(de); desenha(0, 0, 1);
    var comeca = function () { t0 = performance.now(); raf = 0; segue(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(comeca); else comeca();
  })();

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
