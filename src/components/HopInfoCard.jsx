import { useStore } from '../store/index.js'

const T = {
  bg: '#161b22', border: '#21262d', border2: '#30363d',
  text: '#e6edf3', textSec: '#8b949e', textMut: '#484f58',
  blue: '#388bfd', green: '#3fb950', red: '#f85149',
  orange: '#d29922', purple: '#a371f7', cyan: '#39c5cf',
  ui: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', Consolas, monospace",
}

const ACTION_BADGE = {
  ORIGIN:  { color: T.blue,   label: 'Origin',    icon: '●' },
  FORWARD: { color: T.cyan,   label: 'Forward',   icon: '→' },
  ROUTE:   { color: T.orange, label: 'Route',     icon: '⤳' },
  PERMIT:  { color: T.green,  label: 'Permit',    icon: '✓' },
  DENY:    { color: T.red,    label: 'Denied',    icon: '✕' },
  DELIVER: { color: T.purple, label: 'Delivered', icon: '★' },
}

const PHASE_COLORS = {
  DNS: '#a371f7', ARP: '#d29922', L2: '#388bfd', L3: '#39c5cf',
  TCP: '#3fb950', VLAN: '#388bfd', CAM: '#39c5cf', RIB: '#d29922',
  CEF: '#d29922', FWD: '#3fb950', RECV: '#8b949e', ACL: '#f85149',
  MATCH: '#f85149', SESSION: '#a371f7', NAT: '#d29922', INSPECT: '#d29922',
  TLS: '#a371f7', APP: '#3fb950', TTL: '#f85149', NOTE: '#8b949e',
}

const MEDIUM_META = {
  fiber:    { color: T.blue,   icon: '◈', label: 'Fiber'    },
  copper:   { color: T.orange, icon: '◉', label: 'Copper'   },
  wireless: { color: T.purple, icon: '◎', label: 'Wireless' },
}

export function HopInfoCard({ topology }) {
  const { trace, traceStep, tracing, replaying } = useStore()
  if (!trace || traceStep < 0) return null

  const hop = trace.hops[traceStep]
  const node = topology?.nodes?.find(n => n.id === hop?.nodeId)
  const badge = ACTION_BADGE[hop?.action] || { color: T.textSec, label: hop?.action, icon: '·' }
  const stages = hop?.stages || []
  const isFirst = traceStep === 0
  const isLast = traceStep === trace.hops.length - 1
  const medium = hop?.inMedium ? MEDIUM_META[hop.inMedium] : null
  const inReview = !tracing && trace

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: T.bg, border: `1px solid ${T.border2}`,
      borderRadius: 10, padding: '14px 18px', minWidth: 400, maxWidth: 560,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
      fontFamily: T.ui, color: T.text, zIndex: 10,
    }}>
      {/* Review banner */}
      {inReview && (
        <div style={{ marginBottom: 10, padding: '4px 10px', background: T.blue + '12', border: `1px solid ${T.blue}30`, borderRadius: 5, fontSize: 11, color: T.blue, textAlign: 'center' }}>
          {replaying ? '▶ Replaying' : '⏸ Review — use ⏮ ▶ ⏭ in toolbar to step through'}
        </div>
      )}

      {/* Medium transit */}
      {medium && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px', background: medium.color + '10', border: `1px solid ${medium.color}28`, borderRadius: 5 }}>
          <span style={{ color: medium.color, fontSize: 12 }}>{medium.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: medium.color }}>{medium.label}</span>
          <span style={{ fontSize: 11, color: T.textMut }}>— arrived via {hop.inMedium}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 16, color: badge.color }}>{badge.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: badge.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {badge.label}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            {hop?.label || node?.label}
            <span style={{ fontSize: 11, color: T.textMut, fontWeight: 400, marginLeft: 8, fontFamily: T.mono }}>
              {node?.ip}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: T.textMut }}>Hop</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: badge.color, fontFamily: T.mono }}>
            {traceStep + 1}<span style={{ color: T.textMut, fontSize: 11 }}>/{trace.hops.length}</span>
          </div>
        </div>
      </div>

      {/* Stage timeline */}
      {stages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {stages.map((s, i) => {
            const phaseColor = PHASE_COLORS[s.phase] || T.textSec
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{
                  minWidth: 58, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                  color: phaseColor, background: phaseColor + '14',
                  border: `1px solid ${phaseColor}30`, borderRadius: 3,
                  padding: '2px 5px', textAlign: 'center', marginTop: 1, flexShrink: 0,
                  fontFamily: T.mono,
                }}>
                  {s.phase}
                </span>
                <span style={{ fontSize: 11, color: T.textSec, lineHeight: 1.5, fontFamily: T.mono }}>
                  {s.detail}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: T.textMut, fontFamily: T.mono, flexShrink: 0 }}>
          +{hop?.latencyMs}ms
        </span>
        {isFirst && <span style={{ fontSize: 10, color: T.blue + '88' }}>ORIGIN</span>}
        {isLast && <span style={{ fontSize: 10, color: T.purple + '88' }}>END OF PATH</span>}
        <div style={{ flex: 1, height: 2, background: T.border, borderRadius: 1 }}>
          <div style={{
            height: '100%',
            width: `${((traceStep + 1) / trace.hops.length) * 100}%`,
            background: `linear-gradient(90deg, ${T.blue}, ${badge.color})`,
            transition: 'width 0.4s ease', borderRadius: 1
          }} />
        </div>
      </div>
    </div>
  )
}
