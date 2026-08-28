import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AIChatPopupProps {
  open: boolean;
  onClose: () => void;
}

const POPULAR_DESTINATIONS = [
  'Đà Nẵng',
  'Đà Lạt',
  'Phú Quốc',
  'Nha Trang',
  'Hội An',
  'Sapa',
];

export default function AIChatPopup({ open, onClose }: AIChatPopupProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Xin chào 👋! Tôi là trợ lý du lịch AI của TravelMind. Bạn dự định đi du lịch ở đâu?',
    },
  ]);

  if (!open) return null;

  const handleSend = (destination?: string) => {
    const textToSend = destination || query;
    if (!textToSend.trim()) return;

    setHistory((prev) => [...prev, { role: 'user', text: textToSend }]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Tuyệt vời! Tôi đã có các gợi ý lịch trình tối ưu cho "${textToSend}". Hãy cùng tôi lên kế hoạch chi tiết nhé!`,
        },
      ]);
    }, 600);
  };

  const handleStartPlan = () => {
    onClose();
    navigate('/create-trip');
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[380px] overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-lg">
            🤖
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">TravelMind AI</h4>
            <p className="text-[11px] text-blue-100 font-medium">Trợ lý hành trình 24/7</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-sm text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages Body */}
      <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
        {history.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'glass-card text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-none px-3.5 py-2 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span>AI đang phân tích gợi ý...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Destination Chips */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
          Gợi ý nhanh điểm đến
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => handleSend(dest)}
              className="rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-900/40 dark:hover:text-cyan-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập địa điểm hoặc câu hỏi..."
          className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
        >
          ➤
        </button>
      </div>

      {/* Action footer */}
      <div className="px-3 pb-3 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={handleStartPlan}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-center text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"
        >
          🚀 Bắt đầu tạo lịch trình AI ngay →
        </button>
      </div>
    </div>
  );
}
