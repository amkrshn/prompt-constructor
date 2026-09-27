import {useState} from 'react';
import {usePromptConstructor} from '../../packages/react/src/usePromptConstructor.js';

export function ChatComposer() {
  const [draft, setDraft] = useState('');
  const [target, setTarget] = useState('text');
  const constructor = usePromptConstructor({
    url: '/prompt-constructor/index.html',
    getDraft: () => draft,
    setDraft: (text, meta) => {
      setDraft(text);
      setTarget(meta.renderTarget);
    }
  });

  return <section>
    <button type="button" onClick={() => constructor.open({mode:'text', theme:'light'})}>
      Open Prompt Constructor
    </button>
    <textarea value={draft} onChange={event => setDraft(event.target.value)} />
    <small>Target: {target}</small>
  </section>;
}
