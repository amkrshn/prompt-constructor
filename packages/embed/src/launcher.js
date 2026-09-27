import { connectPromptBuilder } from './host-adapter.js';

/** Creates a modal only; the trigger and draft state belong to the host application. */
export function createPromptBuilder({ url = '/prompt-constructor/index.html', getDraft, setDraft, onInserted = () => {}, onClose = () => {} } = {}) {
  if(typeof getDraft!=='function'||typeof setDraft!=='function')throw new TypeError('Передайте getDraft и setDraft');
  const base = new URL(url, location.href);
  if (!/^https?:$/.test(base.protocol)) throw new TypeError('Используйте HTTP(S) URL конструктора');
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Конструктор промптов');
  dialog.style.cssText = 'width:min(1180px,96vw);max-width:96vw;height:90dvh;max-height:96dvh;padding:0;border:1px solid #77839966;border-radius:14px;overflow:hidden;box-shadow:0 24px 80px #0005;';
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #77839944;font:14px system-ui;';
  const title = document.createElement('span');
  title.textContent = 'Prompt Constructor';
  const closeButton = document.createElement('button');
  closeButton.type = 'button'; closeButton.textContent = 'Закрыть ×';
  closeButton.style.cssText = 'cursor:pointer;padding:6px 10px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;';
  const iframe = document.createElement('iframe');
  iframe.title = 'Конструктор промптов';
  iframe.style.cssText = 'display:block;width:100%;height:calc(100% - 44px);border:0;background:transparent;';
  toolbar.append(title, closeButton); dialog.append(toolbar, iframe);
  document.body.append(dialog);
  let current = { mode: 'text', theme: 'light' }, loaded = false, destroyed = false, trigger = null;
  const close = () => { if (dialog.open) dialog.close(); };
  const configure = () => iframe.contentWindow.postMessage({ type: 'prompt-constructor.prompt.configure', version: 1, ...current }, base.origin);
  const disconnect = connectPromptBuilder({ iframe, allowedOrigin: base.origin, getDraft, setDraft,
    onInserted(text, meta) { close(); onInserted(text, meta); }
  });
  iframe.addEventListener('load', () => { loaded = true; configure(); });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', () => { trigger?.focus(); onClose(); });
  function receive(event) {
    if (event.source !== iframe.contentWindow || event.origin !== base.origin || event.data?.version !== 1) return;
    if (event.data.type === 'prompt-constructor.prompt.close') close();
  }
  window.addEventListener('message', receive);
  return {
    open(options = {}) {
      if (destroyed) throw new Error('Конструктор уже удалён');
      current = { mode: ['text','image','presentation'].includes(options.mode) ? options.mode : 'text', theme: options.theme === 'dark' ? 'dark' : 'light' };
      dialog.style.background = current.theme === 'dark' ? '#121722' : '#f8f9fb';
      dialog.style.color = current.theme === 'dark' ? '#e6ebf5' : '#202b40';
      dialog.style.colorScheme = current.theme;
      if (!iframe.hasAttribute('src')) {
        const target = new URL(base);
        target.searchParams.set('parentOrigin', location.origin);
        target.searchParams.set('mode', current.mode);
        target.searchParams.set('theme', current.theme);
        iframe.src = target.href;
      } else if (loaded) configure();
      if (!dialog.open) { trigger = document.activeElement; dialog.showModal(); }
    },
    close,
    destroy() { close(); destroyed = true; disconnect(); window.removeEventListener('message', receive); dialog.remove(); }
  };
}
