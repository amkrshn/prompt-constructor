/** Shared, app-owned confirmation; cancel is the initial focus. */
export function confirmAction(message,signal){
  return new Promise(resolve=>{
    const previous=document.activeElement;
    const dialog=document.createElement('dialog');
    dialog.style.cssText='max-width:min(440px,90vw);border:1px solid #738095;border-radius:12px;padding:24px;background:Canvas;color:CanvasText;font:16px/1.5 system-ui;';
    const title=document.createElement('p');title.textContent=message;title.id='prompt-constructor-confirm-'+crypto.randomUUID();dialog.setAttribute('aria-labelledby',title.id);
    const actions=document.createElement('div');actions.style.cssText='display:flex;gap:12px;justify-content:flex-end';
    const cancel=document.createElement('button'),accept=document.createElement('button');
    for(const button of [cancel,accept]){button.type='button';button.style.cssText='padding:10px 16px;cursor:pointer;font:inherit';}
    cancel.textContent='Отмена';accept.textContent='Подтвердить';
    let settled=false;
    function finish(value){if(settled)return;settled=true;signal?.removeEventListener('abort',abort);dialog.close();dialog.remove();previous?.focus();resolve(value);}
    const abort=()=>finish(false);
    if(signal?.aborted){resolve(false);return;}
    signal?.addEventListener('abort',abort,{once:true});
    cancel.onclick=()=>finish(false);accept.onclick=()=>finish(true);
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
    dialog.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation();});
    actions.append(cancel,accept);dialog.append(title,actions);document.body.append(dialog);dialog.showModal();cancel.focus();
  });
}
