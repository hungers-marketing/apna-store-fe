(() => {
  const loaderScript = document.currentScript;
  const desktopMedia = window.matchMedia('(min-width: 750px)');

  const loadDesktopSecondaryImages = () => {
    if (!desktopMedia.matches) return;

    document.querySelectorAll('img[data-secondary-src]').forEach((image) => {
      image.srcset = image.dataset.secondarySrcset || '';
      image.src = image.dataset.secondarySrc;
      image.removeAttribute('data-secondary-srcset');
      image.removeAttribute('data-secondary-src');
    });
  };

  loadDesktopSecondaryImages();
  desktopMedia.addEventListener('change', loadDesktopSecondaryImages);
  document.addEventListener('shopify:section:load', loadDesktopSecondaryImages);
  document.addEventListener('featured-showcase:loaded', loadDesktopSecondaryImages);
  document.addEventListener('product-grid:updated', loadDesktopSecondaryImages);

  let disclosureAssetsRequested = false;
  const disclosureObserver = new MutationObserver(() => loadCartDisclosureAssets());

  function loadCartDisclosureAssets() {
    if (disclosureAssetsRequested || !document.querySelector('cart-disclosure-modal, .cart-item__disclosure')) return;

    disclosureAssetsRequested = true;
    disclosureObserver.disconnect();

    [loaderScript?.dataset.disclosureModalSrc, loaderScript?.dataset.disclosureTooltipSrc]
      .filter(Boolean)
      .forEach((source) => {
        const script = document.createElement('script');
        script.src = source;
        script.defer = true;
        document.head.appendChild(script);
      });
  }

  loadCartDisclosureAssets();
  if (!disclosureAssetsRequested) {
    disclosureObserver.observe(document.body, { childList: true, subtree: true });
  }
})();