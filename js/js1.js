(function() {
    'use strict';

    const header = document.getElementById('siteHeader');
    const hero = document.getElementById('hero');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
    const sections = ['hero', 'accounts', 'logContent', 'footer']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    function setHeaderState() {
        if (!header) {
            return;
        }
        const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
        header.classList.toggle('is-glass', window.scrollY >= heroBottom - header.offsetHeight);
    }

    function closeNav() {
        if (!header || !navToggle) {
            return;
        }
        header.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', '打开导航');
    }

    function toggleNav() {
        if (!header || !navToggle) {
            return;
        }
        const isOpen = header.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
    }

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
    window.addEventListener('resize', setHeaderState);

    if (navToggle) {
        navToggle.addEventListener('click', toggleNav);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    const revealEls = document.querySelectorAll('.content');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -48px 0px',
            }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    if ('IntersectionObserver' in window && navLinks.length > 0) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    navLinks.forEach((link) => {
                        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
                        link.classList.toggle('is-active', isActive);
                    });
                });
            },
            {
                threshold: 0.38,
                rootMargin: '-18% 0px -52% 0px',
            }
        );

        sections.forEach((section) => navObserver.observe(section));
    }

    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function(event) {
            event.preventDefault();
            const target = document.getElementById('accounts');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
})();
