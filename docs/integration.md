# Integration

Prompt Constructor can be embedded in any browser application that can host an iframe or modal.

## React

```jsx
'use client';
import {useState} from 'react';
import {usePromptConstructor} from '@prompt-constructor/react';

export function Composer() {
  const [draft, setDraft] = useState('');
  const constructor = usePromptConstructor({
    url: '/prompt-constructor/index.html',
    getDraft: () => draft,
    setDraft: (text, meta) => {
      setDraft(text);
      console.log(meta.mode, meta.renderTarget);
    }
  });

  return <>
    <button type="button" onClick={() => constructor.open({mode:'text'})}>Build prompt</button>
    <textarea value={draft} onChange={e => setDraft(e.target.value)} />
  </>;
}
```

The callback may write to a host draft, an editor, state management, or another application-specific destination. Prompt Constructor does not submit the prompt automatically.

## Framework-neutral

```js
import {createPromptBuilder} from '@prompt-constructor/embed/launcher';

const builder = createPromptBuilder({
  url: '/prompt-constructor/index.html',
  getDraft: () => editor.value,
  setDraft: (text) => { editor.value = text; }
});

button.onclick = () => builder.open({mode:'presentation', theme:'light'});
```

For production, set CSP/frame rules deliberately and serve both host and constructor over HTTPS.
