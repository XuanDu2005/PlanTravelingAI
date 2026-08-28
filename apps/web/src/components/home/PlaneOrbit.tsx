export default function PlaneOrbit() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      {/* 3D Curved Light Trail & Airliner */}
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full transform -rotate-6 scale-110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan to Violet Glow Trail Gradient */}
          <linearGradient id="planeTrailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="planeBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Luminous Glowing Orbital Contrail */}
        <path
          d="M 60,340 C 140,460 380,480 480,320 C 530,240 510,130 480,100"
          stroke="url(#planeTrailGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#trailGlow)"
        />

        {/* Second inner glowing thread */}
        <path
          d="M 120,380 C 200,470 400,470 485,325 C 525,250 510,150 480,100"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          opacity="0.8"
        />

        {/* Photorealistic Passenger Jet Airliner Group (Top Right Position) */}
        <g transform="translate(470, 75) rotate(-28) scale(1.15)">
          {/* Jet Engine Contrail Glow */}
          <circle cx="-18" cy="22" r="10" fill="#38BDF8" className="animate-ping opacity-60" />
          <circle cx="-18" cy="22" r="5" fill="#60A5FA" opacity="0.9" />

          {/* Plane Drop Shadow onto background */}
          <g transform="translate(-8, 12) scale(0.95)" opacity="0.25">
            <path
              d="M 15,-30 L 22,-18 L 45,5 L 45,12 L 20,4 L 18,22 L 28,30 L 28,35 L 15,31 L 2,35 L 2,30 L 12,22 L 10,4 L -15,12 L -15,5 L 8,-18 Z"
              fill="#000000"
              filter="blur(4px)"
            />
          </g>

          {/* Fuselage & Wings (Detailed 3D Airliner Vector) */}
          {/* Main Wings */}
          <path
            d="M 15,-10 L 52,14 L 50,21 L 18,9 L 16,30 L 29,38 L 27,42 L 15,37 L 3,42 L 1,38 L 14,30 L 12,9 L -20,21 L -22,14 L 15,-10 Z"
            fill="url(#planeBodyGradient)"
            stroke="#64748B"
            strokeWidth="0.8"
            className="drop-shadow-lg"
          />

          {/* Fuselage Main Tube */}
          <path
            d="M 15,-38 C 18,-38 21,-25 21,-5 L 21,28 C 21,36 18,40 15,40 C 12,40 9,36 9,28 L 9,-5 C 9,-25 12,-38 15,-38 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />

          {/* Cockpit Windshield Visor (Dark Glass) */}
          <path
            d="M 11,-28 C 13,-30 17,-30 19,-28 L 18,-24 C 16,-25 14,-25 12,-24 Z"
            fill="#1E293B"
          />

          {/* Blue Tail Fin Logo */}
          <path
            d="M 14,24 L 16,24 L 17,39 L 13,39 Z"
            fill="#2563EB"
          />

          {/* Jet Engines under wings */}
          <rect x="26" y="2" width="6" height="12" rx="3" fill="#64748B" stroke="#334155" strokeWidth="0.5" />
          <rect x="-2" y="2" width="6" height="12" rx="3" fill="#64748B" stroke="#334155" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
