import { useStore } from '../store/index.js'

const ACTION_BADGE = {
  ORIGIN:  { color: '#00aaff', label: 'ORIGIN'  },
  FORWARD: { color: '#00cc88', label: 'FORWARD' },
  ROUTE:   { color: '#ff9900', label: 'ROUTE'   },
  PERMIT:  { color: '#00ff88', label: 'PERMIT'  },
  DENY:    { color: '#ff2244', label: '✗ DENY'  },
  DELIVER: { color: '#ffdd00', label: '✓ DELIVERED' },
}

export function HopInfoCard({ topology }) {
  const { trace, traceStep, tracing } = useStore()
  if (!tracing || !trace || traceStep < 0) return null

  const hop = trace.hops[traceStep]
  const node = topology?.nodes?.find(n => n.id === hop?.nodeId)
  const badge = ACTION_BADGE[hop?.action] || { color: '#888', label: hop?.action }

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(5,15,30,0.92)', border: `1px solid ${badge.color}44`,
      borderRadius: 12, padding: '14px 24px', minWidth: 380, maxWidth: 560,
      boxShadow: `0 0 24px ${badge.color}33`, backdropFilter: 'blur(8px)',
      fontFamily: "'SF Mono', Consolas, monospace", color: '#e0f0ff',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{
          background: badge.color + '22', color: badge.color,
          border: `1px solid ${badge.color}55`, borderRadius: 6,
          padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1
        }}>
          {badge.label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{node?.label}</span>
        <span style={{ fontSize: 11, color: '#667', marginLeft: 'auto' }}>
          HOP {traceStep + 1} / {trace.hops.length}
        </span>
      </div>

      <div style={{ fontSize: 12, color: '#8ab', lineHeight: 1.6 }}>
        <div><span style={{ color: '#557' }}>IP:</span> {node?.ip}</div>
        <div><span style={{ color: '#557' }}>Detail:</span> {hop?.detail}</div>
        <div><span style={{ color: '#557' }}>Cumulative latency:</span> {hop?.latencyMs}ms</div>
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 10, height: 3, background: '#112',
        borderRadius: 2, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: `${((traceStep + 1) / trace.hops.length) * 100}%`,
          background: `linear-gradient(90deg, #00aaff, ${badge.color})`,
          transition: 'width 0.4s ease', borderRadius: 2
        }} />
      </div>
    </div>
  )
}
