/**
 * Reusable vine/climber SVG decorations for corners and edges.
 * Each vine is a hand-crafted SVG with organic curves, leaves, tendrils, and small buds.
 * Use as <VineCorner position="tl" /> etc.
 */

interface VineCornerProps {
  position: 'tl' | 'tr' | 'bl' | 'br'
  color?: string
  leafColor?: string
  opacity?: number
  className?: string
}

export function VineCorner({ position, color, leafColor, opacity = 0.12, className = '' }: VineCornerProps) {
  const posClass = {
    tl: 'vine-tl',
    tr: 'vine-tr',
    bl: 'vine-bl',
    br: 'vine-br',
  }[position]

  const stemColor = color || 'var(--color-vine-stem)'
  const leafCol = leafColor || 'var(--color-vine-leaf)'
  const budColor = 'var(--color-vine-bud)'

  return (
    <div className={`${posClass} ${className}`} style={{ opacity }} aria-hidden="true">
      <svg viewBox="0 0 360 560" fill="none" className="w-full h-full">
        {/* Main stem — organic S-curve from top-left corner */}
        <path
          d="M0 0 C15 40 25 80 35 120 C45 160 30 200 45 240 C60 280 40 320 55 360 C70 400 50 440 65 480 C80 520 60 540 70 560"
          stroke={stemColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Secondary vine — branches off */}
        <path
          d="M35 120 C55 100 80 85 110 80 C140 75 160 90 170 110"
          stroke={stemColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M45 240 C65 220 90 210 120 205 C150 200 170 215 180 235"
          stroke={stemColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M55 360 C75 340 95 330 125 325"
          stroke={stemColor}
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Thin tendrils — curly extensions */}
        <path d="M60 170 C70 160 80 155 95 158 C110 161 115 170 108 178" stroke={stemColor} strokeWidth="0.5" />
        <path d="M50 300 C60 290 72 288 85 292" stroke={stemColor} strokeWidth="0.5" />
        <path d="M65 420 C78 410 90 408 100 412" stroke={stemColor} strokeWidth="0.5" />

        {/* Leaves — positioned along the vine */}
        {/* Leaf at secondary vine end */}
        <g transform="translate(170, 110) rotate(15)">
          <path d="M0 0 C-8 -15 -3 -30 0 -35 C3 -30 8 -15 0 0" stroke={leafCol} strokeWidth="0.8" fill="none" />
          <path d="M0 0 L0 -30" stroke={leafCol} strokeWidth="0.4" />
          <path d="M0 -10 C-4 -12 -6 -15 -5 -18" stroke={leafCol} strokeWidth="0.3" />
          <path d="M0 -18 C4 -20 6 -23 5 -26" stroke={leafCol} strokeWidth="0.3" />
        </g>

        {/* Leaf cluster at first branch */}
        <g transform="translate(105, 80) rotate(-25)">
          <path d="M0 0 C-6 -12 -2 -25 0 -30 C2 -25 6 -12 0 0" stroke={leafCol} strokeWidth="0.7" fill="none" />
          <path d="M0 0 L0 -26" stroke={leafCol} strokeWidth="0.35" />
        </g>
        <g transform="translate(115, 75) rotate(10)">
          <path d="M0 0 C-5 -10 -2 -20 0 -24 C2 -20 5 -10 0 0" stroke={leafCol} strokeWidth="0.7" fill="none" />
          <path d="M0 0 L0 -20" stroke={leafCol} strokeWidth="0.35" />
        </g>

        {/* Leaf at second branch */}
        <g transform="translate(180, 235) rotate(20)">
          <path d="M0 0 C-7 -14 -3 -28 0 -33 C3 -28 7 -14 0 0" stroke={leafCol} strokeWidth="0.8" fill="none" />
          <path d="M0 0 L0 -28" stroke={leafCol} strokeWidth="0.4" />
          <path d="M0 -8 C-3 -10 -5 -13 -4 -16" stroke={leafCol} strokeWidth="0.3" />
          <path d="M0 -16 C3 -18 5 -21 4 -24" stroke={leafCol} strokeWidth="0.3" />
        </g>

        {/* Leaves along main stem */}
        <g transform="translate(30, 160) rotate(-40)">
          <path d="M0 0 C-5 -10 -2 -20 0 -24 C2 -20 5 -10 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(50, 200) rotate(30)">
          <path d="M0 0 C-5 -10 -2 -18 0 -22 C2 -18 5 -10 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(35, 280) rotate(-35)">
          <path d="M0 0 C-6 -12 -2 -22 0 -26 C2 -22 6 -12 0 0" stroke={leafCol} strokeWidth="0.7" fill="none" />
        </g>
        <g transform="translate(55, 320) rotate(25)">
          <path d="M0 0 C-5 -10 -2 -18 0 -22 C2 -18 5 -10 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(42, 400) rotate(-30)">
          <path d="M0 0 C-5 -10 -2 -20 0 -24 C2 -20 5 -10 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(60, 450) rotate(20)">
          <path d="M0 0 C-6 -12 -2 -22 0 -26 C2 -22 6 -12 0 0" stroke={leafCol} strokeWidth="0.7" fill="none" />
        </g>

        {/* Small leaf at third branch */}
        <g transform="translate(125, 325) rotate(15)">
          <path d="M0 0 C-5 -10 -2 -20 0 -24 C2 -20 5 -10 0 0" stroke={leafCol} strokeWidth="0.7" fill="none" />
          <path d="M0 0 L0 -20" stroke={leafCol} strokeWidth="0.35" />
        </g>

        {/* Tiny buds / flower dots */}
        <circle cx="170" cy="110" r="3" fill={budColor} opacity="0.35" />
        <circle cx="180" cy="235" r="2.5" fill={budColor} opacity="0.3" />
        <circle cx="95" cy="158" r="2" fill={budColor} opacity="0.25" />
        <circle cx="85" cy="292" r="2" fill={budColor} opacity="0.25" />
        <circle cx="100" cy="412" r="2" fill={budColor} opacity="0.25" />
        <circle cx="125" cy="325" r="2.5" fill={budColor} opacity="0.3" />
        <circle cx="70" cy="560" r="3" fill={budColor} opacity="0.3" />

        {/* Small flowers — 5-petal */}
        <g transform="translate(160, 90)">
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const cx = Math.cos(rad) * 5
            const cy = Math.sin(rad) * 5
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="3"
                ry="5"
                transform={`rotate(${angle + 90} ${cx} ${cy})`}
                fill={budColor}
                opacity="0.12"
              />
            )
          })}
          <circle cx="0" cy="0" r="2" fill={budColor} opacity="0.2" />
        </g>

        <g transform="translate(175, 220)">
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const cx = Math.cos(rad) * 4
            const cy = Math.sin(rad) * 4
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="2.5"
                ry="4"
                transform={`rotate(${angle + 90} ${cx} ${cy})`}
                fill={budColor}
                opacity="0.1"
              />
            )
          })}
          <circle cx="0" cy="0" r="1.5" fill={budColor} opacity="0.18" />
        </g>
      </svg>
    </div>
  )
}

/**
 * Hanging vine — drops down from the top edge of a section.
 */
export function VineHanging({ offset = '15%', color, leafColor, opacity = 0.08 }: {
  offset?: string
  color?: string
  leafColor?: string
  opacity?: number
}) {
  const stemColor = color || 'var(--color-vine-stem)'
  const leafCol = leafColor || 'var(--color-vine-leaf)'
  const budColor = 'var(--color-vine-bud)'

  return (
    <div
      className="vine-hang"
      style={{ left: offset, opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 280" fill="none" className="w-full h-full">
        {/* Main hanging stem */}
        <path
          d="M40 0 C38 30 42 60 38 90 C34 120 44 150 40 180 C36 210 42 240 38 270"
          stroke={stemColor}
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Side tendrils */}
        <path d="M38 60 C28 55 22 60 20 68" stroke={stemColor} strokeWidth="0.6" />
        <path d="M42 120 C52 115 58 120 60 128" stroke={stemColor} strokeWidth="0.6" />
        <path d="M38 180 C28 175 22 180 20 188" stroke={stemColor} strokeWidth="0.6" />
        <path d="M42 240 C50 235 55 238 56 245" stroke={stemColor} strokeWidth="0.6" />

        {/* Leaves */}
        <g transform="translate(20, 68) rotate(-30)">
          <path d="M0 0 C-4 -8 -1.5 -16 0 -19 C1.5 -16 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(60, 128) rotate(25)">
          <path d="M0 0 C-4 -8 -1.5 -16 0 -19 C1.5 -16 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(20, 188) rotate(-25)">
          <path d="M0 0 C-4 -8 -1.5 -16 0 -19 C1.5 -16 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(56, 245) rotate(20)">
          <path d="M0 0 C-3 -6 -1 -12 0 -14 C1 -12 3 -6 0 0" stroke={leafCol} strokeWidth="0.5" fill="none" />
        </g>

        {/* Bud at bottom */}
        <circle cx="38" cy="270" r="2.5" fill={budColor} opacity="0.3" />
      </svg>
    </div>
  )
}

/**
 * Side vine — runs vertically along left or right edge.
 */
export function VineSide({ side = 'left', color, leafColor, opacity = 0.07 }: {
  side?: 'left' | 'right'
  color?: string
  leafColor?: string
  opacity?: number
}) {
  const stemColor = color || 'var(--color-vine-stem)'
  const leafCol = leafColor || 'var(--color-vine-leaf)'
  const budColor = 'var(--color-vine-bud)'

  return (
    <div
      className={side === 'left' ? 'vine-left' : 'vine-right'}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 500" fill="none" className="w-full h-full">
        {/* Main vertical stem */}
        <path
          d="M60 0 C55 40 65 80 58 120 C51 160 67 200 60 240 C53 280 65 320 58 360 C51 400 63 440 56 500"
          stroke={stemColor}
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Branches alternating left/right */}
        <path d="M58 80 C40 70 28 75 22 85" stroke={stemColor} strokeWidth="0.7" />
        <path d="M60 160 C78 150 90 155 96 165" stroke={stemColor} strokeWidth="0.7" />
        <path d="M58 240 C40 230 28 235 22 245" stroke={stemColor} strokeWidth="0.7" />
        <path d="M58 320 C78 310 90 315 96 325" stroke={stemColor} strokeWidth="0.7" />
        <path d="M56 400 C40 390 30 395 25 405" stroke={stemColor} strokeWidth="0.7" />
        <path d="M58 460 C74 450 86 455 90 465" stroke={stemColor} strokeWidth="0.7" />

        {/* Leaves at branch tips */}
        <g transform="translate(22, 85) rotate(-40)">
          <path d="M0 0 C-4 -8 -1.5 -15 0 -18 C1.5 -15 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(96, 165) rotate(35)">
          <path d="M0 0 C-4 -8 -1.5 -15 0 -18 C1.5 -15 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(22, 245) rotate(-35)">
          <path d="M0 0 C-4 -8 -1.5 -15 0 -18 C1.5 -15 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(96, 325) rotate(30)">
          <path d="M0 0 C-4 -8 -1.5 -15 0 -18 C1.5 -15 4 -8 0 0" stroke={leafCol} strokeWidth="0.6" fill="none" />
        </g>
        <g transform="translate(25, 405) rotate(-30)">
          <path d="M0 0 C-3 -6 -1 -12 0 -14 C1 -12 3 -6 0 0" stroke={leafCol} strokeWidth="0.5" fill="none" />
        </g>
        <g transform="translate(90, 465) rotate(25)">
          <path d="M0 0 C-3 -6 -1 -12 0 -14 C1 -12 3 -6 0 0" stroke={leafCol} strokeWidth="0.5" fill="none" />
        </g>

        {/* Small buds */}
        <circle cx="22" cy="85" r="2" fill={budColor} opacity="0.25" />
        <circle cx="96" cy="165" r="2" fill={budColor} opacity="0.25" />
        <circle cx="22" cy="245" r="2" fill={budColor} opacity="0.25" />
        <circle cx="96" cy="325" r="2" fill={budColor} opacity="0.25" />
        <circle cx="56" cy="500" r="2.5" fill={budColor} opacity="0.3" />
      </svg>
    </div>
  )
}

export function FloralDivider() {
  const stemColor = 'var(--color-vine-stem)'
  const goldColor = 'var(--color-vine-bud)'

  return (
    <div className="floral-divider" aria-hidden="true">
      <svg width="200" height="60" viewBox="0 0 200 60" fill="none" className="w-32 sm:w-48 md:w-56 h-auto">
        <path d="M10 30 Q30 28 45 25 Q55 22 65 18" stroke={goldColor} strokeWidth="0.8" opacity="0.4" />
        <path d="M45 25 Q40 18 35 14" stroke={stemColor} strokeWidth="0.6" opacity="0.3" />
        <ellipse cx="35" cy="14" rx="4" ry="6" transform="rotate(-25 35 14)" stroke={stemColor} strokeWidth="0.6" opacity="0.25" fill="none" />
        <path d="M55 22 Q50 15 48 10" stroke={stemColor} strokeWidth="0.6" opacity="0.3" />
        <ellipse cx="48" cy="10" rx="3" ry="5" transform="rotate(-15 48 10)" stroke={stemColor} strokeWidth="0.6" opacity="0.25" fill="none" />
        <circle cx="100" cy="30" r="3" fill={goldColor} opacity="0.5" />
        <circle cx="100" cy="30" r="1.5" fill={goldColor} opacity="0.6" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const cx = 100 + Math.cos(rad) * 8
          const cy = 30 + Math.sin(rad) * 8
          return <ellipse key={i} cx={cx} cy={cy} rx="4" ry="6" transform={`rotate(${angle + 90} ${cx} ${cy})`} fill={goldColor} opacity="0.15" />
        })}
        <path d="M190 30 Q170 28 155 25 Q145 22 135 18" stroke={goldColor} strokeWidth="0.8" opacity="0.4" />
        <path d="M155 25 Q160 18 165 14" stroke={stemColor} strokeWidth="0.6" opacity="0.3" />
        <ellipse cx="165" cy="14" rx="4" ry="6" transform="rotate(25 165 14)" stroke={stemColor} strokeWidth="0.6" opacity="0.25" fill="none" />
        <path d="M145 22 Q150 15 152 10" stroke={stemColor} strokeWidth="0.6" opacity="0.3" />
        <ellipse cx="152" cy="10" rx="3" ry="5" transform="rotate(15 152 10)" stroke={stemColor} strokeWidth="0.6" opacity="0.25" fill="none" />
      </svg>
    </div>
  )
}
