export function ShieldSvg() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-40 h-40" fill="none">
        <defs>
          <radialGradient id="shield-glow" cx="50%" cy="40%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shield-stroke" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="90" r="70" fill="url(#shield-glow)">
          <animate attributeName="r" values="65;75;65" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <path d="M100 30 L150 55 V100 C150 130 100 160 100 160 C100 160 50 130 50 100 V55 Z"
          stroke="url(#shield-stroke)" strokeWidth="2" fill="none">
          <animate attributeName="stroke-dashoffset" values="500;0" dur="2s" fill="freeze" />
          <animate attributeName="stroke-opacity" values="0;1" dur="2s" fill="freeze" />
        </path>
        <path d="M100 35 L148 57 V98 C148 126 100 154 100 154 C100 154 52 126 52 98 V57 Z"
          stroke="none" fill="none" strokeDasharray="500">
        </path>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.8s" begin="1.5s" fill="freeze" />
          <rect x="88" y="78" width="24" height="18" rx="3" stroke="hsl(355,70%,65%)" strokeWidth="2" fill="none" />
          <path d="M94 78 V72 C94 66 100 62 106 66 V72" stroke="hsl(355,70%,65%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="88" r="2.5" fill="hsl(355,70%,65%)" />
          <line x1="100" y1="90.5" x2="100" y2="94" stroke="hsl(355,70%,65%)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export function ClockSvg() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-32 h-32" fill="none">
        <defs>
          <radialGradient id="clock-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="60" fill="url(#clock-glow)">
          <animate attributeName="r" values="55;65;55" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="55" stroke="hsl(355,70%,65%)" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
        <circle cx="100" cy="100" r="50" stroke="hsl(355,70%,65%)" strokeWidth="1" fill="none" strokeOpacity="0.3" />
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const x1 = 100 + Math.cos(angle) * 46
          const y1 = 100 + Math.sin(angle) * 46
          const x2 = 100 + Math.cos(angle) * 50
          const y2 = 100 + Math.sin(angle) * 50
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(355,70%,65%)" strokeWidth={i % 3 === 0 ? 2 : 1} strokeOpacity={i % 3 === 0 ? 0.8 : 0.4} />
        })}
        <circle cx="100" cy="100" r="3" fill="hsl(355,70%,65%)" opacity="0.8" />
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="60s" repeatCount="indefinite" />
          <line x1="100" y1="100" x2="100" y2="60" stroke="hsl(355,70%,65%)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
          <line x1="100" y1="100" x2="100" y2="68" stroke="hsl(355,70%,65%)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="2s" repeatCount="indefinite" />
          <line x1="100" y1="100" x2="100" y2="72" stroke="hsl(355,70%,65%)" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
        </g>
      </svg>
    </div>
  )
}

export function BellSvg() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-36 h-36" fill="none">
        <defs>
          <radialGradient id="bell-glow" cx="50%" cy="35%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[0,1,2].map(i => (
          <circle key={i} cx="100" cy="90" r={40 + i * 15} stroke="hsl(355,70%,65%)" strokeWidth="1" fill="none" opacity="0">
            <animate attributeName="opacity" values="0.5;0" dur="2s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
            <animate attributeName="r" values={`${40 + i * 15};${60 + i * 15}`} dur="2s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <circle cx="100" cy="80" r="35" fill="url(#bell-glow)">
          <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite" />
        </circle>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-5 100 55;5 100 55;-5 100 55" dur="1.5s" repeatCount="indefinite" />
          <path d="M100 45 C100 45 80 50 80 50 L75 80 C75 80 70 95 100 95 C130 95 125 80 125 80 L120 50 C120 50 100 45 100 45 Z"
            stroke="hsl(355,70%,65%)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <line x1="100" y1="95" x2="100" y2="105" stroke="hsl(355,70%,65%)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="108" r="3" fill="none" stroke="hsl(355,70%,65%)" strokeWidth="2" />
        </g>
        <circle cx="100" cy="108" r="4" fill="hsl(355,70%,65%)" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

export function GlobeSvg() {
  const dots = [
    { cx: 100, cy: 40 }, { cx: 140, cy: 55 }, { cx: 155, cy: 90 }, { cx: 140, cy: 130 },
    { cx: 100, cy: 155 }, { cx: 60, cy: 130 }, { cx: 45, cy: 90 }, { cx: 60, cy: 55 },
    { cx: 100, cy: 70 }, { cx: 125, cy: 90 }, { cx: 100, cy: 120 }, { cx: 75, cy: 90 },
  ]
  const orbitDots = [
    { cx: 50, cy: 35, dur: '3s', begin: '0s' },
    { cx: 155, cy: 50, dur: '2.5s', begin: '0.5s' },
    { cx: 160, cy: 120, dur: '3.5s', begin: '1s' },
    { cx: 80, cy: 160, dur: '2.8s', begin: '0.3s' },
  ]
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-36 h-36" fill="none">
        <defs>
          <radialGradient id="globe-glow" cx="50%" cy="45%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="95" r="55" fill="url(#globe-glow)">
          <animate attributeName="r" values="50;60;50" dur="4s" repeatCount="indefinite" />
        </circle>
        <ellipse cx="100" cy="95" rx="50" ry="50" stroke="hsl(355,70%,65%)" strokeWidth="1.2" fill="none" strokeOpacity="0.4" />
        <ellipse cx="100" cy="95" rx="30" ry="50" stroke="hsl(355,70%,65%)" strokeWidth="0.8" fill="none" strokeOpacity="0.25">
          <animateTransform attributeName="transform" type="rotate" values="0 100 95;360 100 95" dur="20s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="100" cy="95" rx="50" ry="20" stroke="hsl(355,70%,65%)" strokeWidth="0.8" fill="none" strokeOpacity="0.25" transform="rotate(-20 100 95)" />
        <line x1="50" y1="95" x2="150" y2="95" stroke="hsl(355,70%,65%)" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="100" y1="45" x2="100" y2="145" stroke="hsl(355,70%,65%)" strokeWidth="0.5" strokeOpacity="0.15" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="2.5" fill="hsl(355,70%,65%)" opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="2;3.5;2" dur={`${2 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {orbitDots.map((od, i) => (
          <circle key={`o${i}`} cx={od.cx} cy={od.cy} r="3" fill="hsl(355,70%,65%)" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur={od.dur} begin={od.begin} repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;4;1.5" dur={od.dur} begin={od.begin} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  )
}

export function AnalyticsSvg() {
  const wavePoints = 30
  const width = 160
  const height = 80
  const baseY = 100

  function makeWavePath(offset: number, amp: number, freq: number, yOffset: number) {
    let d = `M 20 ${baseY + yOffset}`
    for (let i = 0; i <= wavePoints; i++) {
      const x = 20 + (i / wavePoints) * width
      const y = baseY + yOffset + Math.sin((i / wavePoints) * Math.PI * freq + offset) * amp
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return d
  }

  const wave1 = makeWavePath(0, 15, 2, 0)
  const wave2 = makeWavePath(2, 12, 2.5, -5)
  const wave3 = makeWavePath(4, 10, 3, -10)

  const bars = [
    { x: 25, h: 30 }, { x: 42, h: 45 }, { x: 59, h: 35 }, { x: 76, h: 55 },
    { x: 93, h: 40 }, { x: 110, h: 60 }, { x: 127, h: 50 }, { x: 144, h: 65 },
    { x: 161, h: 48 },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-40 h-40" fill="none">
        <defs>
          <linearGradient id="analytics-wave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="analytics-wave2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="analytics-clip">
            <rect x="15" y="55" width="170" height="90" />
          </clipPath>
        </defs>
        {bars.map((b, i) => (
          <rect key={i} x={b.x - 4} y={155 - b.h} width="8" height={b.h} rx="2" fill="hsl(355,70%,65%)" opacity="0">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${2.5 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="y" values={`${155 - b.h};${150 - b.h};${155 - b.h}`} dur={`${2.5 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
          </rect>
        ))}
        <g clipPath="url(#analytics-clip)">
          <path d={wave1 + ` L ${20 + width} ${baseY + 40} L 20 ${baseY + 40} Z`} fill="url(#analytics-wave1)">
            <animateTransform attributeName="transform" type="translate" values="0,0;8,2;0,0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d={wave1} stroke="hsl(355,70%,65%)" strokeWidth="2" fill="none" strokeOpacity="0.7">
            <animateTransform attributeName="transform" type="translate" values="0,0;8,2;0,0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d={wave2 + ` L ${20 + width} ${baseY + 40} L 20 ${baseY + 40} Z`} fill="url(#analytics-wave2)">
            <animateTransform attributeName="transform" type="translate" values="0,0;-6,3;0,0" dur="4s" repeatCount="indefinite" />
          </path>
          <path d={wave2} stroke="hsl(355,70%,65%)" strokeWidth="1.5" fill="none" strokeOpacity="0.5">
            <animateTransform attributeName="transform" type="translate" values="0,0;-6,3;0,0" dur="4s" repeatCount="indefinite" />
          </path>
          <path d={wave3} stroke="hsl(355,70%,65%)" strokeWidth="1" fill="none" strokeOpacity="0.3">
            <animateTransform attributeName="transform" type="translate" values="0,0;5,-2;0,0" dur="5s" repeatCount="indefinite" />
          </path>
        </g>
        <circle cx="105" cy="105" r="3" fill="hsl(355,70%,65%)" opacity="0">
          <animate attributeName="opacity" values="0;0.9;0" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <line x1="105" y1="70" x2="105" y2="155" stroke="hsl(355,70%,65%)" strokeWidth="0.8" strokeDasharray="3,3" strokeOpacity="0.3" />
      </svg>
    </div>
  )
}

export function WebhookSvg() {
  const nodes = [
    { x: 40, y: 80 }, { x: 80, y: 55 }, { x: 80, y: 105 },
    { x: 120, y: 80 }, { x: 160, y: 80 },
    { x: 60, y: 140 }, { x: 140, y: 40 },
  ]
  const lines = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
    [2, 5], [1, 6],
  ]
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-32 h-32" fill="none">
        <defs>
          <radialGradient id="webhook-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(355,70%,65%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(355,70%,65%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="90" r="55" fill="url(#webhook-glow)">
          <animate attributeName="r" values="50;60;50" dur="4s" repeatCount="indefinite" />
        </circle>
        {lines.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke="hsl(355,70%,65%)" strokeWidth="1.2" strokeOpacity="0.25" />
        ))}
        {lines.map(([a, b], i) => (
          <circle key={`p${i}`} r="2.5" fill="hsl(355,70%,65%)" opacity="0.8">
            <animateMotion dur={`${1.5 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.3}s`}>
              <mpath href={`#webhook-line-${i}`} />
            </animateMotion>
          </circle>
        ))}
        {lines.map(([a, b], i) => (
          <path key={`m${i}`} id={`webhook-line-${i}`} d={`M${nodes[a].x},${nodes[a].y} L${nodes[b].x},${nodes[b].y}`} fill="none" />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="5" stroke="hsl(355,70%,65%)" strokeWidth="1.5" fill="none" strokeOpacity="0.5">
              <animate attributeName="r" values="4;6;4" dur={`${2 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r="2.5" fill="hsl(355,70%,65%)" opacity="0.7">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        <circle cx="160" cy="80" r="8" stroke="hsl(355,70%,65%)" strokeWidth="1" fill="none" strokeOpacity="0.3" strokeDasharray="2,2">
          <animateTransform attributeName="transform" type="rotate" values="0 160 80;360 160 80" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
