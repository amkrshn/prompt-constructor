'use client';
import { useCallback, useEffect, useRef } from 'react';
import { createPromptBuilder } from '../../embed/src/launcher.js';

/** One modal per mounted host component. Callbacks always use the latest committed render. */
export function usePromptConstructor({ url='/prompt-constructor/index.html', getDraft, setDraft, onInserted, onClose }) {
  const callbacks=useRef({getDraft,setDraft,onInserted,onClose});
  const instance=useRef(null);
  useEffect(()=>{callbacks.current={getDraft,setDraft,onInserted,onClose};});
  useEffect(()=>{
    const builder=createPromptBuilder({url,
      getDraft:()=>callbacks.current.getDraft(),
      setDraft:(text,meta)=>callbacks.current.setDraft(text,meta),
      onInserted:(text,meta)=>callbacks.current.onInserted?.(text,meta),
      onClose:()=>callbacks.current.onClose?.()
    });
    instance.current=builder;
    return ()=>{instance.current=null;builder.destroy();};
  },[url]);
  const open=useCallback((options={})=>{if(!instance.current)throw new Error('Prompt Constructor ещё не смонтирован');instance.current.open(options);},[]);
  const close=useCallback(()=>instance.current?.close(),[]);
  return {open,close};
}
