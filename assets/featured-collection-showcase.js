(() => {
  const globalKey = 'featuredCollectionShowcaseNav';
  const sliderSelector = '.rounded-products .product-grid.slider';

  // Clean up any residual swipe cursors
  const oldCursor = document.querySelector('.featured-showcase-swipe-cursor');
  if (oldCursor) oldCursor.remove();

  const initSliderArrows = (slider) => {
    if (slider.dataset.showcaseArrowsReady === 'true') return;
    slider.dataset.showcaseArrowsReady = 'true';

    const wrapper = slider.closest('.fc-slider-wrapper') || slider.closest('slider-component');
    if (!wrapper) return;

    const prevBtn = wrapper.querySelector('.fc-slider-arrow--prev');
    const nextBtn = wrapper.querySelector('.fc-slider-arrow--next');
    if (!prevBtn && !nextBtn) return;

    const getScrollStep = () => {
      const firstSlide = slider.querySelector('.slider__slide');
      if (firstSlide) {
        const style = window.getComputedStyle(slider);
        const gap = Number.parseFloat(style.columnGap) || 16;
        return (firstSlide.offsetWidth + gap) * 1.5;
      }
      return slider.clientWidth * 0.75;
    };

    const updateArrowStates = () => {
      const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
      const isStart = slider.scrollLeft <= 5;
      const isEnd = slider.scrollLeft >= maxScroll - 5;

      if (prevBtn) {
        if (isStart) {
          prevBtn.setAttribute('disabled', 'disabled');
          prevBtn.classList.add('is-disabled');
        } else {
          prevBtn.removeAttribute('disabled');
          prevBtn.classList.remove('is-disabled');
        }
      }

      if (nextBtn) {
        if (isEnd || maxScroll <= 0) {
          nextBtn.setAttribute('disabled', 'disabled');
          nextBtn.classList.add('is-disabled');
        } else {
          nextBtn.removeAttribute('disabled');
          nextBtn.classList.remove('is-disabled');
        }
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const step = getScrollStep();
        slider.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const step = getScrollStep();
        slider.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    let scrollFrame = null;
    slider.addEventListener('scroll', () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(() => {
        updateArrowStates();
        scrollFrame = null;
      });
    }, { passive: true });

    window.addEventListener('resize', updateArrowStates, { passive: true });
    window.requestAnimationFrame(updateArrowStates);
    setTimeout(updateArrowStates, 300);
  };

  const init = (root = document) => {
    if (root.matches?.(sliderSelector)) initSliderArrows(root);
    root.querySelectorAll?.(sliderSelector).forEach(initSliderArrows);
  };

  window[globalKey] = { init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', (event) => init(event.target));
})();
