import { useState } from 'react';
import AIChatPopup from './AIChatPopup';

export default function AITravelAssistant() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Floating Greeting Speech Bubble (Pill) */}
        {!chatOpen && (
          <div
            onClick={() => setChatOpen(true)}
            className="cursor-pointer hidden sm:flex items-center gap-2 rounded-full glass-card px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xl transition-all duration-300 hover:scale-105 animate-float-card-1"
          >
            <span className="text-blue-600 dark:text-cyan-300 font-bold">✨</span>
            <span>Hỏi AI TravelMind</span>
          </div>
        )}

        {/* AI Robot Avatar Orb Button with 3D Rendered Glass Visor */}
        <div className="relative group">
          {/* Pulsing Aura Rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-lg opacity-75 group-hover:opacity-100 animate-pulse-ring" />
          
          <button
            type="button"
            onClick={() => setChatOpen((prev) => !prev)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0c2461] via-[#1e3a8a] to-[#4c1d95] shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-assistant-idle border-2 border-cyan-400/60 dark:border-cyan-300/40 p-2 overflow-hidden"
            aria-label="Hỏi AI TravelMind"
            title="Hỏi AI TravelMind"
          >
            {/* Gloss Highlight on top of orb */}
            <div className="absolute -top-1 left-2 w-8 h-4 bg-white/40 rounded-full blur-xs pointer-events-none" />

            {/* Cute Futuristic Robot Head Vector */}
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="visorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
                <linearGradient id="robotHead" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>

              {/* Antenna */}
              <line x1="50" y1="18" x2="50" y2="8" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="8" r="4" fill="#38BDF8" className="animate-ping opacity-80" />
              <circle cx="50" cy="8" r="3" fill="#FFFFFF" />

              {/* Robot Ears / Headphone Rings */}
              <rect x="12" y="38" width="8" height="24" rx="4" fill="#818CF8" />
              <rect x="80" y="38" width="8" height="24" rx="4" fill="#818CF8" />

              {/* Main White Head Shell */}
              <rect x="18" y="20" width="64" height="60" rx="24" fill="url(#robotHead)" stroke="#94A3B8" strokeWidth="1" />

              {/* Dark Visor Screen */}
              <rect x="26" y="34" width="48" height="30" rx="14" fill="#0F172A" />

              {/* Glowing Curved Visor Eyes */}
              <ellipse cx="38" cy="48" rx="5" ry="6" fill="#38BDF8" />
              <ellipse cx="62" cy="48" rx="5" ry="6" fill="#38BDF8" />
              
              {/* Eye Catchlights */}
              <circle cx="36" cy="46" r="1.5" fill="#FFFFFF" />
              <circle cx="60" cy="46" r="1.5" fill="#FFFFFF" />

              {/* Cute Smiling Mouth Line */}
              <path d="M 44 56 Q 50 60 56 56" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>

            {/* Glowing online indicator */}
            <span className="absolute bottom-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border-2 border-white dark:border-slate-900" />
            </span>
          </button>
        </div>
      </div>

      {/* Interactive AI Chat Modal */}
      <AIChatPopup open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
