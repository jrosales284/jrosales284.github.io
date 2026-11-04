// Portafolio Johanna Rosales — idioma, tema, navegación e interacciones
(function () {
  const root = document.documentElement;
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  const lang = get('lang') || ((navigator.language || 'es').startsWith('en') ? 'en' : 'es');
  root.dataset.lang = lang;
  const theme = get('theme'); if (theme) root.dataset.theme = theme;

  const svg = p => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  const ICON = {
    sun: svg('<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>')
  };
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('langBtn');
    const themeBtn = document.getElementById('themeBtn');
    const menuBtn = document.getElementById('menuBtn');
    const links = document.querySelector('.nav-links');

    const paint = () => {
      root.lang = root.dataset.lang;
      if (langBtn) { langBtn.textContent = root.dataset.lang === 'es' ? 'EN' : 'ES'; langBtn.setAttribute('aria-label', root.dataset.lang === 'es' ? 'Switch to English' : 'Cambiar a español'); }
      if (themeBtn) { themeBtn.innerHTML = isDark() ? ICON.sun : ICON.moon; themeBtn.setAttribute('aria-label', isDark() ? 'Modo claro' : 'Modo oscuro'); }
      document.dispatchEvent(new CustomEvent('ui-change'));
    };
    langBtn && langBtn.addEventListener('click', () => { root.dataset.lang = root.dataset.lang === 'es' ? 'en' : 'es'; set('lang', root.dataset.lang); paint(); });
    themeBtn && themeBtn.addEventListener('click', () => { root.dataset.theme = isDark() ? 'light' : 'dark'; set('theme', root.dataset.theme); paint(); });

    // Menú móvil
    if (menuBtn && links) {
      menuBtn.innerHTML = ICON.menu;
      menuBtn.setAttribute('aria-expanded', 'false');
      const toggle = open => { links.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.innerHTML = open ? ICON.close : ICON.menu; };
      menuBtn.addEventListener('click', () => toggle(!links.classList.contains('open')));
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    }

    // Sombra del nav al hacer scroll
    const nav = document.querySelector('.nav');
    const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Sección activa en el menú
    const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const targets = navAnchors.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && targets.length) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          navAnchors.forEach(a => { const on = a.getAttribute('href') === '#' + en.target.id; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(t => spy.observe(t));
    }

    // Filtros de proyectos
    const filters = document.querySelectorAll('.filter');
    filters.forEach(btn => {
      btn.setAttribute('aria-pressed', btn.classList.contains('active'));
      btn.addEventListener('click', () => {
        filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
        const f = btn.dataset.f;
        document.querySelectorAll('.card').forEach(c => c.classList.toggle('hide', f !== 'all' && !c.dataset.cat.split(' ').includes(f)));
      });
    });

    // Aparición suave al hacer scroll
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => io.observe(el));
    } else revealEls.forEach(el => el.classList.add('in'));

    // Lightbox para capturas
    const shots = document.querySelectorAll('.shot img');
    if (shots.length) {
      let lb = document.getElementById('lb');
      if (!lb) { lb = document.createElement('div'); lb.id = 'lb'; lb.className = 'lightbox'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb); }
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
      const close = document.createElement('button'); close.className = 'lb-close'; close.setAttribute('aria-label', 'Cerrar'); close.innerHTML = ICON.close; lb.appendChild(close);
      const img = lb.querySelector('img');
      const hide = () => lb.classList.remove('on');
      shots.forEach(i => {
        i.tabIndex = 0;
        const open = () => { img.src = i.currentSrc || i.src; img.alt = i.alt; lb.classList.add('on'); close.focus(); };
        i.addEventListener('click', open);
        i.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      });
      lb.addEventListener('click', hide);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    }

    // Foto: si no existe img/foto.jpg se muestran iniciales
    const avatar = document.querySelector('.avatar img');
    if (avatar) avatar.addEventListener('error', () => { avatar.outerHTML = '<div class="initials">JR</div>'; });

    // Oculta los botones de CV si el PDF todavía no está subido
    const cv = document.querySelectorAll('a[href$="Johanna-Rosales-CV.pdf"]');
    if (cv.length && location.protocol !== 'file:') {
      fetch(cv[0].href, { method: 'HEAD' })
        .then(r => { if (!r.ok) cv.forEach(a => a.hidden = true); })
        .catch(() => cv.forEach(a => a.hidden = true));
    }

    paint();
  });
})();
