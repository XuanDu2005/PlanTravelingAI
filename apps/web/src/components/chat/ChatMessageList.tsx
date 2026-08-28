import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { ChatMessage } from '@/types';

interface Props {
  messages: ChatMessage[];
  pending?: boolean;
  onPromptClick?: (prompt: string) => void;
}

export default function ChatMessageList({ messages, pending, onPromptClick }: Props) {
  const { t } = useTranslation();

  const quickPrompts = useMemo(() => [
    {
      icon: '🏖️',
      title: t('chat.prompt1'),
      prompt: t('chat.prompt1Full'),
    },
    {
      icon: '🌸',
      title: t('chat.prompt2'),
      prompt: t('chat.prompt2Full'),
    },
    {
      icon: '🏝️',
      title: t('chat.prompt3'),
      prompt: t('chat.prompt3Full'),
    },
    {
      icon: '🍜',
      title: t('chat.prompt4'),
      prompt: t('chat.prompt4Full'),
    },
  ], [t]);

  if (messages.length === 0 && !pending) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center max-w-lg mx-auto space-y-6">
        
        {/* Glowing Sparkle Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
            <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
            <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
            <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
          </svg>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t('chat.welcomeTitle')}
          </h4>
        </div>

        {/* Simplified Quick Prompt Cards */}
        <div className="w-full grid gap-2.5 sm:grid-cols-2 pt-1">
          {quickPrompts.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => onPromptClick?.(item.prompt)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-[#111A2E]/90 p-3 text-left hover:border-blue-500 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {pending && (
        <div className="flex items-start gap-3 justify-start animate-in fade-in">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
              <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
              <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
            </svg>
          </div>
          <div className="rounded-2xl rounded-tl-sm border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111A2E] px-3.5 py-2.5 shadow-xs">
            <div className="flex items-center gap-2" aria-label={t('chat.thinking')}>
              <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">{t('chat.generating')}</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  const isUser = message.role === 'USER';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success(t('chat.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
      {/* AI Bot Avatar */}
      {!isUser && (
        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M10 2L12.5 8.5L19 11L12.5 13.5L10 20L7.5 13.5L1 11L7.5 8.5L10 2Z" />
            <path d="M18 1L19.2 4.2L22.4 5.4L19.2 6.6L18 9.8L16.8 6.6L13.6 5.4L16.8 4.2L18 1Z" />
            <path d="M18.5 14L19.3 16.3L21.6 17.1L19.3 17.9L18.5 20.2L17.7 17.9L15.4 17.1L17.7 16.3L18.5 14Z" />
          </svg>
        </div>
      )}

      {/* Message Bubble Body */}
      <div className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs ${
        isUser
          ? 'rounded-tr-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-medium shadow-blue-500/10'
          : 'rounded-tl-sm border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111A2E] text-slate-800 dark:text-slate-100 leading-relaxed'
      }`}>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Copy button for Assistant messages */}
        {!isUser && (
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 absolute -bottom-2.5 right-2 flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 dark:hover:text-cyan-300 shadow-2xs transition cursor-pointer"
            title={t('chat.copy')}
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>{copied ? t('chat.copied') : t('chat.copy')}</span>
          </button>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-xs shrink-0 mt-0.5">
          U
        </div>
      )}
    </div>
  );
}