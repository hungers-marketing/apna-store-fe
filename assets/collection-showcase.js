(() => {
  const STORAGE_KEY = 'collection-grid-density';

  const getShowcase = () => document.querySelector('.collection-showcase');

  const getSavedDensity = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || 'roomy';
    } catch (error) {
      return 'roomy';
    }
  };

  const saveDensity = (density) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, density);
    } catch (error) {
      // Storage can be unavailable in privacy mode; the current view still updates.
    }
  };

  const applyGridDensity = (density = getSavedDensity()) => {
    const showcase = getShowcase();
    const grid = showcase?.querySelector('#product-grid');
    const buttons = showcase?.querySelectorAll('.collection-grid-controls__button');
    if (!showcase || !grid || !buttons?.length) return;

    const activeIndex = density === 'compact' ? 0 : 1;
    const activeButton = buttons[activeIndex];
    grid.style.setProperty('--collection-columns-mobile', activeButton.dataset.mobileColumns);
    grid.style.setProperty('--collection-columns-desktop', activeButton.dataset.desktopColumns);

    buttons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.collection-grid-controls__button');
    if (!button || !getShowcase()?.contains(button)) return;

    const buttons = [...button.parentElement.querySelectorAll('.collection-grid-controls__button')];
    const density = buttons.indexOf(button) === 0 ? 'compact' : 'roomy';
    saveDensity(density);
    applyGridDensity(density);
  });

  document.addEventListener('product-grid:updated', () => applyGridDensity());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyGridDensity(), { once: true });
  } else {
    applyGridDensity();
  }
})();
