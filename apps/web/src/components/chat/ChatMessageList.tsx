import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';

interface Props {
  messages: ChatMessage[];
  pending?: boolean;
}

export default function ChatMessageList({ messages, pending }: Props) {
  const { t } = useTranslation();

  if (messages.length === 0 && !pending) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <p className="text-sm text-ink-500 dark:text-slate-400">{t('chat.empty')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {pending && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink-700 shadow-sm dark:border-surface-100 dark:bg-surface-200 dark:text-slate-200">
            <span className="inline-flex gap-1" aria-label={t('chat.thinking')}>
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s] dark:bg-slate-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s] dark:bg-slate-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 dark:bg-slate-500" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'border border-ink-100 bg-white text-ink-800 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}