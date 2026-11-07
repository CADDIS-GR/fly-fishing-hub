const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  function updateHeader(){
    header.classList.toggle('scrolled', window.scrollY > 36);
  }

  window.addEventListener('scroll', updateHeader);
  updateHeader();

  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
    });
  });

  // ── 최근 조행기 및 장비 리뷰 첫 화면 자동 동기화 ──
  async function initRecentUpdates() {
    const container = document.getElementById('recentUpdatesGrid');
    if (!container) return;

    try {
      const [fieldRes, gearRes] = await Promise.allSettled([
        fetch('field-log/index.html').then(r => r.ok ? r.text() : ''),
        fetch('gear/index.html').then(r => r.ok ? r.text() : '')
      ]);

      const parser = new DOMParser();
      const items = [];

      if (fieldRes.status === 'fulfilled' && fieldRes.value) {
        const doc = parser.parseFromString(fieldRes.value, 'text/html');
        doc.querySelectorAll('.content-grid a.content-card').forEach(card => {
          const kicker = card.querySelector('.section-kicker')?.textContent.trim() || '';
          const title = card.querySelector('h2')?.textContent.trim() || '';
          const desc = card.querySelector('p')?.textContent.trim() || '';
          const tag = card.querySelector('.tag')?.textContent.trim() || 'FIELD TESTED';
          const rawHref = card.getAttribute('href') || '';
          const href = rawHref.startsWith('http') || rawHref.startsWith('/') ? rawHref : `field-log/${rawHref}`;
          const m = (kicker + ' ' + desc).match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
          const date = m ? `${m[1]}-${m[2]}-${m[3]}` : '2026-00-00';
          items.push({ date, kicker, title, desc, tag, href });
        });
      }

      if (gearRes.status === 'fulfilled' && gearRes.value) {
        const doc = parser.parseFromString(gearRes.value, 'text/html');
        doc.querySelectorAll('.content-grid a.content-card').forEach(card => {
          const kicker = card.querySelector('.section-kicker')?.textContent.trim() || '';
          const title = card.querySelector('h2')?.textContent.trim() || '';
          const desc = card.querySelector('p')?.textContent.trim() || '';
          const tag = card.querySelector('.tag')?.textContent.trim() || 'GEAR';
          const rawHref = card.getAttribute('href') || '';
          const href = rawHref.startsWith('http') || rawHref.startsWith('/') ? rawHref : `gear/${rawHref}`;
          const m = (kicker + ' ' + desc).match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
          const date = m ? `${m[1]}-${m[2]}-${m[3]}` : '2026-00-00';
          items.push({ date, kicker, title, desc, tag, href });
        });
      }

      if (items.length > 0) {
        items.sort((a, b) => b.date.localeCompare(a.date));
        const top3 = items.slice(0, 3);
        container.innerHTML = top3.map(item => `
          <a href="${item.href}" class="note-card">
            <div class="note-date">${item.kicker.toUpperCase()}</div>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <span class="note-result">${item.tag}</span>
          </a>
        `).join('');
      }
    } catch (e) {
      console.warn('Recent updates dynamic load skipped:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecentUpdates);
  } else {
    initRecentUpdates();
  }