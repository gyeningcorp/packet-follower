import { useStore } from '../store/index.js'

const ACTION_BADGE = {
  ORIGIN:  { color: '#00aaff', label: 'PACKET BORN',     icon: '◎' },
  FORWARD: { color: '#00cc88', label: 'FORWARD',          icon: '→' },
  ROUTE:   { color: '#ff9900', label: 'ROUTE',            icon: '⊕' },
  PERMIT:  { color: '#00ff88', label: 'PERMIT',           icon: '✓' },
  DENY:    { color: '#ff2244', label: 'DENIED — DROPPED', icon: '✗' },
  DELIVER: { color: '#ffdd00', label: 'DELIVERED',        icon: '★' },
}

const PHASE_COLORS = {
  DNS: '#aa88ff', ARP: '#ff9900', L2: '#00aaff', L3: '#00ccff',
  TCP: '#00ff88', VLAN: '#44ccff', CAM: '#88ffcc', RIB: '#ffaa44',
  CEF: '#ff8844', FWD: '#aaffaa', RECV: '#667788', ACL: '#ffdd44',
  MATCH: '#00ff88', SESSION: '#44ddff', NAT: '#ffaa88', INSPECT: '#ffcc44',
  TLS: '#cc88ff', APP: '#ffdd00',
}

export function HopInfoCard({ topology }) {
  const { trace, traceStep, tracing } = useStore()
  if (!tracing || !trace || traceStep < 0) return null

  const hop = trace.hops[traceStep]
  const node = topology?.nodes?.find(n => n.id === hop?.nodeId)
  const badge = ACTION_BADGE[hop?.action] || { color: '#888', label: hop?.action, icon: '·' }
  const stages = hop?.stages || []
  const isFirst = traceStep === 0
  const isLast = traceStep === trace.hops.length - 1

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(4,10,22,0.94)', border: `1px solid ${badge.color}33`,
      borderRadius: 14, padding: '16px 22px', minWidth: 420, maxWidth: 580,
      boxShadow: `0 0 32px ${badge.color}22`, backdropFilter: 'blur(10px)',
      fontFamily: "'SF Mono', Consolas, monospace", color: '#e0f0ff',
      transition: 'all 0.35s ease', zIndex: 10
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18, filter: `drop-shadow(0 0 6px ${badge.color})` }}>
          {badge.icon}
        </span>
        <div>
          <div style={{ fontSize: 10, color: badge.color, letterSpacing: 1.5, fontWeight: 700 }}>
            {badge.label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e8f4ff', marginTop: 1 }}>
            {hop?.label || node?.label}
            <span style={{ fontSize: 11, color: '#445', fontWeight: 400, marginLeft: 8 }}>
              {node?.ip}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#445', letterSpacing: 1 }}>HOP</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: badge.color }}>
            {traceStep + 1}<span style={{ color: '#334', fontSize: 11 }}>/{trace.hops.length}</span>
          </div>
        </div>
      </div>

      {/* Stage timeline */}
      {stages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          {stages.map((s, i) => {
            const phaseColor = PHASE_COLORS[s.phase] || '#667'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{
                  minWidth: 62, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  color: phaseColor, background: phaseColor + '18',
                  border: `1px solid ${phaseColor}33`, borderRadius: 4,
                  padding: '2px 5px', textAlign: 'center', marginTop: 1, flexShrink: 0
                }}>
                  {s.phase}
                </span>
                <span style={{ color: '#1a3a5c', fontSize: 10, marginTop: 3 }}>│</span>
                <span style={{ fontSize: 11, color: '#8ab', lineHeight: 1.5 }}>
                  {s.detail}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer: latency + markers + progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#334', flexShrink: 0 }}>+{hop?.latencyMs}ms</span>
        {isFirst && <span style={{ fontSize: 9, color: '#00aaff66', letterSpacing: 1 }}>ORIGIN</span>}
        {isLast  && <span style={{ fontSize: 9, color: '#ffdd0066', letterSpacing: 1 }}>END OF PATH</span>}
        <div style={{ flex: 1, height: 2, background: '#0d1f30', borderRadius: 1 }}>
          <div style={{
            height: '100%',
            width: `${((traceStep + 1) / trace.hops.length) * 100}%`,
            background: `linear-gradient(90deg, #00aaff, ${badge.color})`,
            transition: 'width 0.5s ease', borderRadius: 1
          }} />
        </div>
      </div>
    </div>
  )
}
