(() => {
  const maxFiles = 10;
  const maxTotalBytes = 50 * 1024 * 1024;

  const initUpload = (container) => {
    if (container.dataset.uploadReady === 'true') return;

    const input = container.querySelector('[data-contact-file-input]');
    const status = container.querySelector('[data-contact-file-status]');
    if (!input || !status) return;

    container.dataset.uploadReady = 'true';

    const validate = () => {
      const files = Array.from(input.files || []);
      const totalBytes = files.reduce((total, file) => total + file.size, 0);
      let message = '';

      if (files.length > maxFiles) message = `Please select no more than ${maxFiles} files.`;
      if (totalBytes > maxTotalBytes) message = 'Total file size must be less than 50MB.';

      input.setCustomValidity(message);
      status.classList.toggle('is-error', Boolean(message));
      status.textContent = message || (files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : '');
    };

    input.addEventListener('change', validate);
    input.addEventListener('dragenter', () => container.classList.add('is-dragging'));
    input.addEventListener('dragleave', () => container.classList.remove('is-dragging'));
    input.addEventListener('drop', () => {
      container.classList.remove('is-dragging');
      window.setTimeout(validate, 0);
    });

    container.addEventListener('paste', (event) => {
      const pastedFiles = Array.from(event.clipboardData?.files || []);
      if (!pastedFiles.length || typeof DataTransfer === 'undefined') return;

      const transfer = new DataTransfer();
      Array.from(input.files || []).forEach((file) => transfer.items.add(file));
      pastedFiles.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
      validate();
      event.preventDefault();
    });
  };

  const init = (root = document) => root.querySelectorAll('[data-contact-upload]').forEach(initUpload);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => init(event.target));
})();
