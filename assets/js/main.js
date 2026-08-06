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