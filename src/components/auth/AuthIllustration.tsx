type Props = {
  src?: string
  alt: string
}

export default function AuthIllustration({ src, alt }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="max-h-[560px] w-full max-w-[640px] object-contain"
      />
    )
  }

  return <AdminIllustration alt={alt} />
}

function AdminIllustration({ alt }: { alt: string }) {
  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 600 540"
      className="h-auto w-full max-w-[600px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E8279" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0E8279" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background decorative shapes */}
      <circle cx="500" cy="80" r="130" fill="#0E8279" opacity="0.08" />
      <circle cx="80" cy="460" r="90" fill="#0E8279" opacity="0.06" />

      {/* Dotted accent — top left */}
      <g fill="#0E8279" opacity="0.35">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={32 + col * 14}
              cy={60 + row * 14}
              r={2}
            />
          )),
        )}
      </g>

      {/* Floating notification card — top left */}
      <g transform="translate(40, 200)">
        <rect
          x="2"
          y="4"
          width="128"
          height="52"
          rx="12"
          fill="black"
          opacity="0.08"
        />
        <rect
          x="0"
          y="0"
          width="128"
          height="52"
          rx="12"
          fill="white"
          stroke="#e5e7eb"
        />
        {/* Bell icon */}
        <g transform="translate(12, 14)">
          <circle cx="12" cy="12" r="12" fill="#0E8279" opacity="0.12" />
          <path
            d="M12 5 C 8.5 5 7 7.5 7 11 L 7 14 L 5.5 16 L 18.5 16 L 17 14 L 17 11 C 17 7.5 15.5 5 12 5 Z"
            fill="#0E8279"
          />
          <circle cx="12" cy="18.5" r="1.6" fill="#0E8279" />
          <circle cx="19" cy="6" r="3" fill="#ef4444" />
        </g>
        <rect x="48" y="14" width="64" height="7" rx="3.5" fill="#1f2937" />
        <rect x="48" y="27" width="48" height="5" rx="2.5" fill="#d1d5db" />
        <rect x="48" y="38" width="36" height="5" rx="2.5" fill="#d1d5db" />
      </g>

      {/* Main dashboard card */}
      <g transform="translate(110, 80)">
        {/* Shadow */}
        <rect
          x="4"
          y="6"
          width="400"
          height="300"
          rx="16"
          fill="black"
          opacity="0.06"
        />
        {/* Window */}
        <rect
          x="0"
          y="0"
          width="400"
          height="300"
          rx="16"
          fill="white"
          stroke="#e5e7eb"
        />

        {/* Top bar */}
        <rect x="0" y="0" width="400" height="36" rx="16" fill="#f9fafb" />
        <rect x="0" y="18" width="400" height="18" fill="#f9fafb" />
        <line x1="0" y1="36" x2="400" y2="36" stroke="#e5e7eb" />
        <circle cx="20" cy="18" r="4" fill="#ef4444" />
        <circle cx="36" cy="18" r="4" fill="#fbbf24" />
        <circle cx="52" cy="18" r="4" fill="#22c55e" />
        <rect x="160" y="12" width="120" height="12" rx="6" fill="#e5e7eb" />

        {/* Sidebar */}
        <rect x="0" y="36" width="84" height="264" fill="#f9fafb" />
        <line x1="84" y1="36" x2="84" y2="300" stroke="#e5e7eb" />

        {/* Logo block in sidebar */}
        <rect x="16" y="50" width="52" height="14" rx="4" fill="#0E8279" />

        {/* Sidebar nav items (admin menu) */}
        <g>
          {/* Active item */}
          <rect
            x="12"
            y="84"
            width="60"
            height="20"
            rx="6"
            fill="#0E8279"
            opacity="0.12"
          />
          <circle cx="22" cy="94" r="3" fill="#0E8279" />
          <rect x="30" y="91" width="34" height="6" rx="3" fill="#0E8279" />

          {/* Users */}
          <circle cx="22" cy="122" r="3" fill="#9ca3af" />
          <rect x="30" y="119" width="40" height="5" rx="2.5" fill="#9ca3af" />

          {/* Revenue */}
          <circle cx="22" cy="146" r="3" fill="#9ca3af" />
          <rect x="30" y="143" width="44" height="5" rx="2.5" fill="#9ca3af" />

          {/* Coin packages */}
          <circle cx="22" cy="170" r="3" fill="#9ca3af" />
          <rect x="30" y="167" width="36" height="5" rx="2.5" fill="#9ca3af" />

          {/* Support */}
          <circle cx="22" cy="194" r="3" fill="#9ca3af" />
          <rect x="30" y="191" width="40" height="5" rx="2.5" fill="#9ca3af" />

          {/* Settings */}
          <circle cx="22" cy="218" r="3" fill="#9ca3af" />
          <rect x="30" y="215" width="32" height="5" rx="2.5" fill="#9ca3af" />
        </g>

        {/* Main content area — Title */}
        <rect x="104" y="56" width="120" height="12" rx="6" fill="#1f2937" />
        <rect x="104" y="74" width="180" height="6" rx="3" fill="#d1d5db" />

        {/* KPI cards */}
        <g transform="translate(104, 100)">
          {/* Users KPI */}
          <rect
            x="0"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#eff6ff"
            stroke="#bfdbfe"
          />
          <circle cx="14" cy="14" r="7" fill="#3b82f6" />
          <circle cx="14" cy="12" r="2.2" fill="white" />
          <path d="M 9 18 Q 14 14 19 18 L 19 19.5 L 9 19.5 Z" fill="white" />
          <rect x="10" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="10" y="42" width="28" height="5" rx="2.5" fill="#9ca3af" />

          {/* Revenue KPI */}
          <rect
            x="98"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#f0fdf4"
            stroke="#bbf7d0"
          />
          <circle cx="112" cy="14" r="7" fill="#22c55e" />
          <text
            x="112"
            y="18"
            fontSize="10"
            fontWeight="700"
            fill="white"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
          >
            $
          </text>
          <rect x="108" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="108" y="42" width="32" height="5" rx="2.5" fill="#9ca3af" />

          {/* Orders/Coins KPI */}
          <rect
            x="196"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#fff7ed"
            stroke="#fed7aa"
          />
          <circle cx="210" cy="14" r="7" fill="#f59e0b" />
          <circle cx="210" cy="14" r="3.5" fill="#fff7ed" />
          <rect x="206" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="206" y="42" width="24" height="5" rx="2.5" fill="#9ca3af" />
        </g>

        {/* Area chart */}
        <g transform="translate(104, 170)">
          {/* Grid lines */}
          <line x1="0" y1="100" x2="288" y2="100" stroke="#e5e7eb" />
          <line
            x1="0"
            y1="70"
            x2="288"
            y2="70"
            stroke="#f3f4f6"
            strokeDasharray="2 3"
          />
          <line
            x1="0"
            y1="40"
            x2="288"
            y2="40"
            stroke="#f3f4f6"
            strokeDasharray="2 3"
          />
          <line
            x1="0"
            y1="15"
            x2="288"
            y2="15"
            stroke="#f3f4f6"
            strokeDasharray="2 3"
          />

          {/* Area fill */}
          <path
            d="M 0 80 L 36 60 L 72 70 L 108 40 L 144 50 L 180 25 L 216 35 L 252 20 L 288 30 L 288 100 L 0 100 Z"
            fill="url(#areaFill)"
          />
          {/* Line */}
          <path
            d="M 0 80 L 36 60 L 72 70 L 108 40 L 144 50 L 180 25 L 216 35 L 252 20 L 288 30"
            fill="none"
            stroke="#0E8279"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {[
            { x: 0, y: 80 },
            { x: 36, y: 60 },
            { x: 72, y: 70 },
            { x: 108, y: 40 },
            { x: 144, y: 50 },
            { x: 180, y: 25 },
            { x: 216, y: 35 },
            { x: 252, y: 20 },
            { x: 288, y: 30 },
          ].map((p) => (
            <circle
              key={`${p.x}-${p.y}`}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="white"
              stroke="#0E8279"
              strokeWidth="2"
            />
          ))}

          {/* Highlight tooltip on peak */}
          <g transform="translate(252, -8)">
            <rect
              x="-22"
              y="0"
              width="44"
              height="20"
              rx="6"
              fill="#0E8279"
            />
            <text
              x="0"
              y="13"
              fontSize="9"
              fontWeight="700"
              fill="white"
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
            >
              +24%
            </text>
          </g>
        </g>
      </g>

      {/* User management card — front layer, overlapping bottom right */}
      <g transform="translate(380, 280)">
        {/* Shadow */}
        <rect
          x="6"
          y="8"
          width="160"
          height="220"
          rx="18"
          fill="black"
          opacity="0.12"
        />
        {/* Card body */}
        <rect
          x="0"
          y="0"
          width="160"
          height="220"
          rx="18"
          fill="white"
          stroke="#e5e7eb"
        />

        {/* Header */}
        <rect x="0" y="0" width="160" height="44" rx="18" fill="#0E8279" />
        <rect x="0" y="22" width="160" height="22" fill="#0E8279" />
        <rect x="14" y="16" width="80" height="6" rx="3" fill="white" opacity="0.95" />
        <rect x="14" y="28" width="56" height="5" rx="2.5" fill="white" opacity="0.7" />

        {/* User rows */}
        {[0, 1, 2, 3].map((i) => {
          const avatarColors = ['#3b82f6', '#f59e0b', '#22c55e', '#a855f7']
          const statusColors = ['#22c55e', '#22c55e', '#f59e0b', '#22c55e']
          return (
            <g key={i} transform={`translate(0, ${56 + i * 38})`}>
              {/* Avatar */}
              <circle cx="22" cy="16" r="12" fill={avatarColors[i]} opacity="0.18" />
              <circle cx="22" cy="13" r="4.5" fill={avatarColors[i]} />
              <path
                d={`M 13 25 Q 22 19 31 25 L 31 27 Q 22 30 13 27 Z`}
                fill={avatarColors[i]}
              />

              {/* Name + email lines */}
              <rect x="42" y="10" width="64" height="6" rx="3" fill="#1f2937" />
              <rect x="42" y="22" width="48" height="5" rx="2.5" fill="#d1d5db" />

              {/* Status dot */}
              <circle cx="138" cy="16" r="4" fill={statusColors[i]} />

              {/* Divider */}
              {i < 3 && (
                <line x1="14" y1="36" x2="146" y2="36" stroke="#f3f4f6" />
              )}
            </g>
          )
        })}
      </g>

      {/* Floating admin shield — bottom left */}
      <g transform="translate(120, 420)">
        <circle cx="0" cy="0" r="28" fill="white" stroke="#e5e7eb" />
        <circle cx="0" cy="0" r="28" fill="#0E8279" opacity="0.08" />
        {/* Shield */}
        <path
          d="M 0 -14 L 12 -9 L 12 2 C 12 9 7 13 0 16 C -7 13 -12 9 -12 2 L -12 -9 Z"
          fill="#0E8279"
        />
        {/* Check */}
        <path
          d="M -5 1 L -1 5 L 6 -3"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating dollar coin — bottom near phone area */}
      <g transform="translate(360, 470)">
        <circle cx="0" cy="0" r="22" fill="white" stroke="#e5e7eb" />
        <circle cx="0" cy="0" r="22" fill="#f59e0b" opacity="0.12" />
        <text
          x="0"
          y="6"
          fontSize="20"
          fontWeight="700"
          fill="#f59e0b"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
        >
          $
        </text>
      </g>
    </svg>
  )
}
