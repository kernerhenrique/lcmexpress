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
      $('#r-tipo').textContent = tipo;
      $('#r-dest').textContent = pais ? (cidade ? cidade + ', ' + pais : pais) : '—';
      $('#r-qtd').textContent = qtd;
      $('#r-real').textContent = peso > 0 ? kg(peso * qtd) : '—';
      $('#r-cub').textContent = cub > 0 ? kg(cub * qtd) : '—';
      var cons = Math.max(peso > 0 ? peso : 0, cub > 0 ? cub : 0) * qtd;
      $('#r-cons').textContent = cons > 0 ? kg(cons) : '—';
      return { tipo: tipo, qtd: qtd, peso: peso, c: c, l: l, a: a, cub: cub, cons: cons, pais: pais, cidade: cidade };
    }
    function mensagem(d) {
      var L = ['Olá, LCM Express! Gostaria de uma cotação de envio internacional.', '', '*Tipo:* ' + d.tipo, '*Destino:* ' + (d.cidade ? d.cidade + ', ' : '') + d.pais, '*Volumes:* ' + d.qtd];
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
      [['c-pais', 'e-pais'], ['c-nome', 'e-nome']].forEach(function (p) { var i = $('#' + p[0]); if (!i.value.trim()) { i.closest('.campo').classList.add('invalido'); i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', p[1]); faltam.push(i); } else i.removeAttribute('aria-invalid'); });
      if (faltam.length) { faltam[0].focus(); return; }
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem(calcula()));
      window.open(url, '_blank', 'noopener');
    });
    atualizaMail();
  })();

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
