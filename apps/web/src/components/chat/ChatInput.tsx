import { useState, type FormEvent, type KeyboardEvent, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D162B]/90 p-3 backdrop-blur-md shrink-0"
    >
      <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-[#111A2E]/90 p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={t('chat.inputPlaceholder')}
          disabled={disabled}
          className="min-h-[38px] max-h-28 flex-1 resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="flex items-center gap-1.5 pb-1 pr-1">
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
            title={t('chat.send')}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}