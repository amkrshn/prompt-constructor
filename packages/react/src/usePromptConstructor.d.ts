export type PromptMode = 'text' | 'image' | 'presentation';
export type PromptMeta =
  | {mode:'text';renderTarget:'text'}
  | {mode:'image';renderTarget:'image'|'svg'}
  | {mode:'presentation';renderTarget:'presentation'};
export interface PromptConstructorOptions {
  url?: string;
  getDraft: () => string | Promise<string>;
  setDraft: (text:string, meta:PromptMeta) => void | Promise<void>;
  onInserted?: (text:string, meta:PromptMeta) => void;
  onClose?: () => void;
}
export function usePromptConstructor(options:PromptConstructorOptions): {
  open: (options?:{mode?:PromptMode;theme?:'light'|'dark'}) => void;
  close: () => void;
};
