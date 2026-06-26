// A self-contained animated SVG avatar styled after Dala — short black hair
// swept up at the front, tan skin, clean-shaven, with a casual hoodie and
// headphones for a cooler vibe. It gently bobs, tilts, blinks and waves.
// No external assets, so it always renders offline.
export default function AnimatedAvatar() {
  return (
    <svg
      className="avatar3d"
      viewBox="0 0 200 200"
      role="img"
      aria-label="Animated avatar"
    >
      <defs>
        <radialGradient id="av-bg" cx="50%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#243456" />
          <stop offset="100%" stopColor="#0b1019" />
        </radialGradient>
        <linearGradient id="av-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6cff" />
          <stop offset="100%" stopColor="#2c3bbd" />
        </linearGradient>
        <linearGradient id="av-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cd9a6e" />
          <stop offset="100%" stopColor="#b07e54" />
        </linearGradient>
        <linearGradient id="av-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2118" />
          <stop offset="100%" stopColor="#120d09" />
        </linearGradient>
        <clipPath id="av-clip"><circle cx="100" cy="100" r="100" /></clipPath>
      </defs>

      <g clipPath="url(#av-clip)">
        <circle cx="100" cy="100" r="100" fill="url(#av-bg)" />

        {/* the whole character bobs gently */}
        <g className="avatar3d__bob">
          {/* shoulders / hoodie */}
          <path
            d="M34 200 Q34 152 72 140 L128 140 Q166 152 166 200 Z"
            fill="url(#av-hoodie)"
          />
          {/* hood collar */}
          <path d="M70 142 Q100 128 130 142 Q116 156 100 156 Q84 156 70 142 Z" fill="#2c3bbd" />
          {/* drawstrings */}
          <line x1="96" y1="152" x2="92" y2="186" stroke="#dfe6ff" strokeWidth="3" strokeLinecap="round" />
          <line x1="104" y1="152" x2="108" y2="186" stroke="#dfe6ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="92" cy="187" r="3" fill="#dfe6ff" />
          <circle cx="108" cy="187" r="3" fill="#dfe6ff" />

          {/* neck */}
          <rect x="88" y="112" width="24" height="28" rx="10" fill="url(#av-skin)" />
          <path d="M88 132 Q100 140 112 132 L112 140 L88 140 Z" fill="#a06f48" opacity="0.5" />

          {/* head group — tilts */}
          <g className="avatar3d__head">
            {/* ears */}
            <circle cx="61" cy="90" r="7.5" fill="url(#av-skin)" />
            <circle cx="139" cy="90" r="7.5" fill="url(#av-skin)" />

            {/* face */}
            <path
              d="M64 84 Q64 46 100 46 Q136 46 136 84 Q136 114 118 126 Q100 134 82 126 Q64 114 64 84 Z"
              fill="url(#av-skin)"
            />
            {/* subtle cheek shading */}
            <ellipse cx="79" cy="100" rx="7" ry="9" fill="#a06f48" opacity="0.18" />
            <ellipse cx="121" cy="100" rx="7" ry="9" fill="#a06f48" opacity="0.18" />

            {/* short black hair, swept up at the front */}
            <path
              d="M62 86 Q58 44 100 42 Q142 44 138 86 Q138 70 128 60
                 Q120 52 108 54 Q104 46 96 48 Q86 50 82 58
                 Q72 60 66 72 Q62 78 62 86 Z"
              fill="url(#av-hair)"
            />
            {/* front quiff lift */}
            <path d="M84 56 Q98 44 116 56 Q104 52 96 54 Q88 54 84 56 Z" fill="#34281d" />

            {/* eyebrows */}
            <path d="M76 80 Q85 75 94 79" stroke="#1c150e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M106 79 Q115 75 124 80" stroke="#1c150e" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* eyes (blink via scaleY) */}
            <g className="avatar3d__eyes">
              <ellipse cx="85" cy="88" rx="5" ry="4" fill="#fff" />
              <ellipse cx="115" cy="88" rx="5" ry="4" fill="#fff" />
              <circle cx="86" cy="88" r="2.6" fill="#241a12" />
              <circle cx="116" cy="88" r="2.6" fill="#241a12" />
            </g>

            {/* nose */}
            <path d="M100 92 L96 104 Q100 107 104 104 Z" fill="#a06f48" opacity="0.45" />

            {/* friendly smile */}
            <path d="M88 110 Q100 119 112 110" stroke="#8a4f31" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>

          {/* headphones — band over the hair, cups by the ears */}
          <g className="avatar3d__head">
            <path d="M58 88 Q58 38 100 38 Q142 38 142 88" stroke="#11151f" strokeWidth="6" fill="none" strokeLinecap="round" />
            <rect x="50" y="82" width="16" height="22" rx="7" fill="#1b2333" />
            <rect x="134" y="82" width="16" height="22" rx="7" fill="#1b2333" />
            <rect x="52" y="86" width="5" height="14" rx="2.5" fill="#5a6cff" />
            <rect x="143" y="86" width="5" height="14" rx="2.5" fill="#5a6cff" />
          </g>

          {/* waving hand */}
          <g className="avatar3d__wave">
            <rect x="150" y="150" width="15" height="42" rx="7.5" fill="url(#av-hoodie)" transform="rotate(28 157 171)" />
            <circle cx="172" cy="138" r="11.5" fill="url(#av-skin)" />
          </g>
        </g>
      </g>
    </svg>
  )
}
