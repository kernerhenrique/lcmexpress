/* ==========================================================================
   LCM Express — interações e animações
   JavaScript puro, sem bibliotecas externas.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- utils */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* --------------------------------------------- 1. ano atual no rodapé */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------- 2. divisão de títulos em palavras */
  /* Cada palavra recebe uma máscara para revelar o texto de baixo para cima,
     preservando tags internas (ex.: <em>). */
  function splitWords(root) {
    var nodes = [];
    (function walk(node) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        if (child.nodeType === 3 && child.nodeValue.trim()) nodes.push(child);
        else if (child.nodeType === 1) walk(child);
      }
    })(root);

    nodes.forEach(function (textNode) {
      var frag = document.createDocumentFragment();
      var parts = textNode.nodeValue.split(/(\s+)/);

      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        var word = document.createElement('span');
        word.className = 'word';
        var inner = document.createElement('span');
        inner.textContent = part;
        word.appendChild(inner);
        frag.appendChild(word);
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });

    /* atraso progressivo palavra a palavra */
    $$('.word > span', root).forEach(function (span, i) {
      span.style.transitionDelay = (i * 45) + 'ms';
    });
  }

  if (!reduceMotion) $$('[data-split]').forEach(splitWords);

  /* --------------------------------- 3. revelação no scroll (observer) */
  var revealTargets = $$('[data-reveal], [data-split]');

  revealTargets.forEach(function (el) {
    var delay = el.getAttribute('data-delay');
    if (delay) el.style.setProperty('--rd', delay + 'ms');
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------- 4. header fixo e progresso */
  var header = $('#siteHeader');
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);

    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }

    if (typeof updateActiveLink === 'function') updateActiveLink();
  }

  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      onScroll();
      scrollQueued = false;
    });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------- 5. menu mobile (drawer) */
  var nav = $('#primaryNav');
  var navToggle = $('#navToggle');
  var backdrop = $('#navBackdrop');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('nav-open', open);
    if (backdrop) {
      if (open) {
        backdrop.hidden = false;
        window.requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
      } else {
        backdrop.classList.remove('is-visible');
        window.setTimeout(function () { backdrop.hidden = true; }, 350);
      }
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setNav(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });
  $$('#primaryNav a').forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });

  /* ------------------------------- 6. link ativo conforme a seção */
  var navLinks = $$('.nav-link');
  var sections = navLinks
    .map(function (link) {
      var el = document.querySelector(link.getAttribute('href'));
      return el ? { id: el.id, el: el, link: link } : null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    if (!sections || !sections.length) return;
    var anchor = window.innerHeight * 0.38;
    var current = sections[0];

    sections.forEach(function (item) {
      if (item.el.getBoundingClientRect().top <= anchor) current = item;
    });

    /* próximo ao fim da página, destaca a última seção */
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 80) {
      current = sections[sections.length - 1];
    }

    sections.forEach(function (item) {
      item.link.classList.toggle('is-active', item === current);
    });
  }

  updateActiveLink();

  /* ------------------------------------------- 7. contadores animados */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var useGroup = !!prefix; /* anos (1997) ficam sem separador de milhar */
    var duration = reduceMotion ? 0 : 1600;
    var start = null;

    function format(value) {
      var n = Math.round(value);
      return prefix + (useGroup ? n.toLocaleString('pt-BR') : String(n));
    }

    if (!duration) { el.textContent = format(target); return; }

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  var counters = $$('.counter');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ------------------------------- 8. acordeão: abre um item por vez */
  var accordionItems = $$('.accordion .ac-item');
  accordionItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      accordionItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ------------------------------------ 9. parallax suave no hero */
  if (!reduceMotion && window.matchMedia('(min-width: 981px)').matches) {
    var hero = $('#hero');
    var heroVisual = $('.hero-visual');
    var orbs = $$('.hero .orb');

    if (hero && heroVisual) {
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.transform = 'translate3d(' + (x * 16).toFixed(2) + 'px,' + (y * 16).toFixed(2) + 'px,0)';
        orbs.forEach(function (orb, i) {
          var k = (i + 1) * 12;
          orb.style.transform = 'translate3d(' + (-x * k).toFixed(2) + 'px,' + (-y * k).toFixed(2) + 'px,0)';
        });
      });
      hero.addEventListener('pointerleave', function () {
        heroVisual.style.transform = '';
        orbs.forEach(function (orb) { orb.style.transform = ''; });
      });
    }
  }

  /* ------------------------ 10. formulário de cotação → WhatsApp */
  var form = $('#quoteForm');
  var status = $('#formStatus');
  var WHATSAPP_NUMBER = '5527999610409';

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message || '';
    status.className = 'form-status' + (type ? ' is-' + type : '');
  }

  if (form) {
    $$('input, select, textarea', form).forEach(function (field) {
      field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
      field.addEventListener('change', function () { field.classList.remove('is-invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = $$('[required]', form);
      var firstInvalid = null;

      required.forEach(function (field) {
        var valid = field.value.trim() !== '' && (!field.checkValidity || field.checkValidity());
        field.classList.toggle('is-invalid', !valid);
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        setStatus('Confira os campos destacados para continuarmos.', 'error');
        firstInvalid.focus();
        return;
      }

      function val(name) {
        var field = form.elements[name];
        return field && field.value.trim() ? field.value.trim() : '';
      }

      var lines = [
        'Olá! Gostaria de solicitar uma cotação de envio internacional.',
        '',
        'Nome: ' + val('nome')
      ];
      if (val('empresa')) lines.push('Empresa: ' + val('empresa'));
      lines.push('E-mail: ' + val('email'));
      lines.push('Telefone: ' + val('telefone'));
      lines.push('Tipo de envio: ' + val('tipo'));
      lines.push('País de destino: ' + val('destino'));
      if (val('peso')) lines.push('Peso aproximado: ' + val('peso'));
      if (val('dimensoes')) lines.push('Dimensões: ' + val('dimensoes'));
      lines.push('', 'Detalhes: ' + val('mensagem'));

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank', 'noopener');

      setStatus('Tudo certo! Abrimos o WhatsApp com os seus dados — basta enviar a mensagem.', 'ok');

      /* se o navegador bloquear a nova aba, segue no mesmo separador */
      if (!win) window.location.href = url;
    });
  }
})();
