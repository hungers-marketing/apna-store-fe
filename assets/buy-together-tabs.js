if (!customElements.get('buy-together-tabs')) {
  customElements.define(
    'buy-together-tabs',
    class BuyTogetherTabs extends HTMLElement {
      connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;

        this.tabs = Array.from(this.querySelectorAll('[data-buy-together-tab]'));
        this.panels = Array.from(this.querySelectorAll('[data-buy-together-panel]'));

        if (!this.tabs.length || this.tabs.length !== this.panels.length) return;

        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.selectTab(index));
          tab.addEventListener('keydown', (event) => this.handleKeydown(event, index));
        });

        this.classList.add('is-tabs-ready');
        this.selectTab(0, false);
      }

      selectTab(selectedIndex, moveFocus = false) {
        this.tabs.forEach((tab, index) => {
          const isSelected = index === selectedIndex;
          tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          tab.tabIndex = isSelected ? 0 : -1;
          this.panels[index].classList.toggle('is-active', isSelected);
          this.panels[index].hidden = !isSelected;
        });

        if (moveFocus) this.tabs[selectedIndex].focus();
      }

      handleKeydown(event, currentIndex) {
        let nextIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % this.tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = this.tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        this.selectTab(nextIndex, true);
      }
    }
  );
}
