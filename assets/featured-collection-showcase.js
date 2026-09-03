(() => {
  const globalKey = 'featuredCollectionShowcaseDrag';
  const sliderSelector = '.rounded-products .product-grid.slider';

  if (window[globalKey]) {
    window[globalKey].init(document);
    return;
  }

  const isInteractive = (target) =>
    Boolean(target.closest('button, input, select, textarea, summary, [role="button"]'));

  const handleCardNavigation = (event) => {
    if (event.defaultPrevented || event.target.closest('a, button, input, select, textarea, summary, [role="button"]')) {
      return;
    }

    const card = event.target.closest('.card--featured-showcase');
    const productLink = card?.querySelector(':scope > .featured-showcase-card-link');
    if (productLink?.href) window.location.assign(productLink.href);
  };

  document.addEventListener('click', handleCardNavigation);

  const initPagination = (slider) => {
    if (slider.dataset.showcasePaginationReady === 'true') return;

    const component = slider.closest('slider-component');
    const pagination = component?.querySelector('[data-featured-showcase-dots]');
    const dots = pagination ? Array.from(pagination.querySelectorAll('[data-slide-index]')) : [];
    const slides = Array.from(slider.querySelectorAll('.slider__slide'));

    if (!pagination || dots.length === 0 || slides.length === 0) return;
    slider.dataset.showcasePaginationReady = 'true';

    const setActiveDot = (index) => {
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const getInlineInset = () => Number.parseFloat(window.getComputedStyle(slider).paddingLeft) || 0;

    const updateActiveDot = () => {
      const targetLeft = slider.getBoundingClientRect().left + getInlineInset();
      let activeIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - targetLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      setActiveDot(activeIndex);
    };

    let scrollFrame = null;
    slider.addEventListener('scroll', () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(() => {
        updateActiveDot();
        scrollFrame = null;
      });
    }, { passive: true });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slide = slides[Number(dot.dataset.slideIndex)];
        if (!slide) return;

        const targetLeft =
          slider.scrollLeft +
          slide.getBoundingClientRect().left -
          slider.getBoundingClientRect().left -
          getInlineInset();

        slider.scrollTo({ left: targetLeft, behavior: 'smooth' });
      });
    });

    updateActiveDot();
  };

  const initSlider = (slider) => {
    initPagination(slider);
    if (slider.dataset.showcaseDragReady === 'true') return;
    slider.dataset.showcaseDragReady = 'true';

    const cursor = document.createElement('span');
    cursor.className = 'featured-showcase-swipe-cursor';
    cursor.textContent = 'swipe';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);

    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;
    let suppressClick = false;

    const hasOverflow = () => slider.scrollWidth > slider.clientWidth + 1;

    const positionCursor = (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    };

    const showCursor = (event) => {
      positionCursor(event);
      cursor.classList.toggle('is-visible', hasOverflow() && !isInteractive(event.target));
    };

    const snapToNearestCard = () => {
      const slides = Array.from(slider.querySelectorAll('.slider__slide'));
      if (slides.length === 0) return;

      const sliderLeft = slider.getBoundingClientRect().left;
      let nearestTarget = slider.scrollLeft;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide) => {
        const target = slider.scrollLeft + slide.getBoundingClientRect().left - sliderLeft;
        const distance = Math.abs(target - slider.scrollLeft);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestTarget = target;
        }
      });

      slider.scrollTo({ left: nearestTarget, behavior: 'smooth' });
    };

    const finishDrag = (event) => {
      if (pointerId === null) return;

      if (slider.hasPointerCapture(pointerId)) {
        slider.releasePointerCapture(pointerId);
      }

      suppressClick = dragged;
      pointerId = null;
      slider.classList.remove('is-pointer-dragging');
      cursor.classList.remove('is-dragging');
      positionCursor(event);

      if (dragged) {
        window.requestAnimationFrame(snapToNearestCard);
      }

      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    slider.addEventListener('pointerenter', showCursor);
    slider.addEventListener('pointermove', (event) => {
      positionCursor(event);

      if (pointerId === null) {
        cursor.classList.toggle('is-visible', hasOverflow() && !isInteractive(event.target));
        return;
      }

      const distance = event.clientX - startX;
      if (!dragged && Math.abs(distance) > 4) {
        dragged = true;
        slider.setPointerCapture(pointerId);
        slider.classList.add('is-pointer-dragging');
        cursor.classList.add('is-visible', 'is-dragging');
      }

      if (dragged) {
        event.preventDefault();
        slider.scrollLeft = startScrollLeft - distance;
      }
    });

    slider.addEventListener('pointerleave', () => {
      if (pointerId === null) cursor.classList.remove('is-visible');
    });

    slider.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !hasOverflow() || isInteractive(event.target)) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = slider.scrollLeft;
      dragged = false;
    });

    slider.addEventListener('pointerup', finishDrag);
    slider.addEventListener('pointercancel', finishDrag);
    slider.addEventListener('dragstart', (event) => event.preventDefault());
    slider.addEventListener(
      'click',
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    slider.showcaseSwipeCursor = cursor;
  };

  const observedRecommendationSections = new WeakSet();
  const recommendationObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ target }) => {
      init(target);
      document.dispatchEvent(new CustomEvent('featured-showcase:loaded'));
    });
  });

  const observeRecommendationSections = (root) => {
    const sections = [];
    if (root.matches?.('[data-featured-showcase-recommendations]')) sections.push(root);
    root.querySelectorAll?.('[data-featured-showcase-recommendations]').forEach((section) => sections.push(section));

    sections.forEach((section) => {
      if (observedRecommendationSections.has(section)) return;
      observedRecommendationSections.add(section);
      recommendationObserver.observe(section, { childList: true });
    });
  };

  const init = (root = document) => {
    if (root.matches?.(sliderSelector)) initSlider(root);
    root.querySelectorAll?.(sliderSelector).forEach(initSlider);
    observeRecommendationSections(root);
  };

  window[globalKey] = { init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', (event) => init(event.target));
  document.addEventListener('shopify:section:unload', (event) => {
    event.target.querySelectorAll(sliderSelector).forEach((slider) => {
      slider.showcaseSwipeCursor?.remove();
    });
  });
})();
