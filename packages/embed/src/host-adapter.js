import { trustedMessage } from '../../core/src/core.js';
import { confirmAction } from './confirm.js';

/** setDraft must complete only after the host has accepted the new draft. */
export function connectPromptBuilder({ iframe, allowedOrigin, getDraft, setDraft, onInserted = () => {} }) {
  const origin = new URL(allowedOrigin).origin;
  if (typeof getDraft !== 'function' || typeof setDraft !== 'function') throw new TypeError('Передайте getDraft и setDraft');
  const handled = new Map();
  const lifecycle = new AbortController();
  let busy = false;
  async function receive(event) {
    if (lifecycle.signal.aborted || !trustedMessage(event, iframe.contentWindow, origin)) return;
    const data = event.data;
    const reply = status => event.source.postMessage({ type: 'prompt-constructor.prompt.ack', version: 1, requestId: data.requestId, status }, origin);
    if (handled.has(data.requestId)) { reply(handled.get(data.requestId)); return; }
    if (busy) { reply('error'); return; }
    busy = true;
    let status = 'error';
    const mode=data.mode||(data.renderTarget==='presentation'?'presentation':['image','svg'].includes(data.renderTarget)?'image':'text');
    const meta = { mode, renderTarget: data.renderTarget || mode };
    try {
      const current=await getDraft();
      if(lifecycle.signal.aborted)return;
      if (String(current).trim() && !await confirmAction('Заменить текущий текст сообщения новым промптом?',lifecycle.signal)) status = 'cancelled';
      else if(!lifecycle.signal.aborted) { await setDraft(data.prompt, meta); status = 'inserted'; }
    } catch (error) { console.error('Не удалось вставить промпт', error); }
    handled.set(data.requestId, status);
    if (handled.size > 100) handled.delete(handled.keys().next().value);
    busy = false;
    if(lifecycle.signal.aborted)return;
    reply(status);
    if (status === 'inserted') onInserted(data.prompt, meta);
  }
  window.addEventListener('message', receive);
  return () => {lifecycle.abort();window.removeEventListener('message', receive);};
}
