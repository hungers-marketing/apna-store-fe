(() => {
  const activateTab = (showcase, tab) => {
    const tabs = [...showcase.querySelectorAll('[data-mega-tab]')];
    const panes = [...showcase.querySelectorAll('.mega-showcase__pane')];
    const activeIndex = tabs.indexOf(tab);
    if (activeIndex < 0) return;

    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panes.forEach((pane, index) => {
      const active = index === activeIndex;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
      pane.setAttribute('aria-hidden', active ? 'false' : 'true');
      pane.style.setProperty('display', active ? 'block' : 'none', 'important');
    });
  };

  const initialiseShowcase = (showcase) => {
    if (showcase.dataset.megaInitialised === 'true') return;
    showcase.dataset.megaInitialised = 'true';

    const initialTab = showcase.querySelector('[data-mega-tab].is-active') || showcase.querySelector('[data-mega-tab]');
    if (initialTab) activateTab(showcase, initialTab);

    showcase.querySelectorAll('[data-mega-tab]').forEach((tab) => {
      tab.addEventListener('mouseenter', () => activateTab(showcase, tab));
      tab.addEventListener('focus', () => activateTab(showcase, tab));
    });

    showcase.querySelectorAll('[data-mega-scroll]').forEach((button) => {
      button.addEventListener('click', () => {
        const track = button.closest('.mega-showcase__pane')?.querySelector('[data-mega-product-track]');
        if (!track) return;
        const direction = Number(button.dataset.megaScroll) || 1;
        track.scrollBy({ left: direction * track.clientWidth * 0.75, behavior: 'smooth' });
      });
    });
  };

  const initialiseMenu = (menu) => {
    if (menu.dataset.hoverMegaInitialised === 'true') return;
    menu.dataset.hoverMegaInitialised = 'true';

    const details = menu.querySelector(':scope > details.mega-menu');
    const summary = details?.querySelector(':scope > summary');
    const headerSection = menu.closest('.section-header');
    if (!details || !summary) return;

    let closeTimer;
    const openMenu = () => {
      window.clearTimeout(closeTimer);
      document.querySelectorAll('header-menu > details.mega-menu[open]').forEach((openDetails) => {
        if (openDetails !== details) {
          openDetails.removeAttribute('open');
          openDetails.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'false');
        }
      });
      details.open = true;
      summary.setAttribute('aria-expanded', 'true');
      headerSection?.classList.add('is-mega-menu-open');
    };
    const scheduleClose = () => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (details.contains(document.activeElement)) return;
        details.open = false;
        summary.setAttribute('aria-expanded', 'false');
        headerSection?.classList.remove('is-mega-menu-open');
      }, 180);
    };

    menu.addEventListener('mouseenter', openMenu);
    menu.addEventListener('mouseleave', scheduleClose);
    menu.addEventListener('focusin', openMenu);
    summary.addEventListener('click', (event) => {
      const parentUrl = summary.dataset.megaParentUrl;
      if (!parentUrl || parentUrl === '#') return;
      event.preventDefault();
      window.location.assign(parentUrl);
    });
    details.addEventListener('toggle', () => {
      headerSection?.classList.toggle('is-mega-menu-open', details.open);
    });
  };

  const activateMobileTab = (megaMenu, tab) => {
    const tabs = [...megaMenu.querySelectorAll('[data-mobile-mega-tab]')];
    const panes = [...megaMenu.querySelectorAll('[data-mobile-mega-pane]')];
    const activeIndex = tabs.indexOf(tab);
    if (activeIndex < 0) return;

    tabs.forEach((item, index) => {
      const active = index === activeIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panes.forEach((pane, index) => {
      const active = index === activeIndex;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
      pane.style.setProperty('display', active ? 'block' : 'none', 'important');
    });
  };

  const initialiseMobileMega = (megaMenu) => {
    if (megaMenu.dataset.mobileMegaInitialised === 'true') return;
    megaMenu.dataset.mobileMegaInitialised = 'true';
    const tabs = megaMenu.querySelectorAll('[data-mobile-mega-tab]');
    tabs.forEach((tab) =>
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        activateMobileTab(megaMenu, tab);
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      })
    );
    const initialTab = megaMenu.querySelector('[data-mobile-mega-tab].is-active') || tabs[0];
    if (initialTab) activateMobileTab(megaMenu, initialTab);
  };

  const initialise = (scope = document) => {
    scope.querySelectorAll?.('[data-mega-showcase]').forEach(initialiseShowcase);
    scope.querySelectorAll?.('header-menu').forEach(initialiseMenu);
    scope.querySelectorAll?.('[data-mobile-mega]').forEach(initialiseMobileMega);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialise());
  } else {
    initialise();
  }

  document.addEventListener('shopify:section:load', (event) => initialise(event.target));
})();