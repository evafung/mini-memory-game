import '@testing-library/jest-dom/vitest';

if (typeof HTMLDialogElement !== 'undefined') {
  const dialogPrototype = HTMLDialogElement.prototype;

  if (typeof dialogPrototype.showModal !== 'function') {
    Object.defineProperty(dialogPrototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute('open', '');
        this.setAttribute('aria-modal', 'true');
      },
    });
  }

  if (typeof dialogPrototype.close !== 'function') {
    Object.defineProperty(dialogPrototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.removeAttribute('open');
        this.removeAttribute('aria-modal');
        this.dispatchEvent(new Event('close'));
      },
    });
  }
}
