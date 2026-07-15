import { useStore } from '../store/index.js'
import { fetchTopology, runTrace } from '../api/index.js'
import { mockDenyTrace } from '../data/mockTopology.js'

// Professional dark theme
const T = {
  bg: '#0d1117', panel: '#161b22', border: '#21262d', border2: '#30363d',
  text: '#e6edf3', textSec: '#8b949e', textMut: '#484f58',
  blue: '#388bfd', green: '#3fb950', red: '#f85149', orange: '#d29922', purple: '#a371f7',
  ui: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', Consolas, monospace",
}

function saveTrace(trace, currentStep) {
  const ts = new Date().toISOString()
  const totalMs = trace.hops.reduce((sum, h) => sum + (h.latencyMs || 0), 0)
  const completedHops = trace.hops.slice(0, currentStep + 1)
  const payload = {
    savedAt: ts, src: trace.src, dst: trace.dst,
    protocol: trace.protocol || 'TCP', dstPort: trace.dstPort,
    status: currentStep >= trace.hops.length - 1 ? 'DELIVERED' : 'IN_PROGRESS',
    totalLatencyMs: totalMs, hopsRecorded: completedHops.length, hopsTotal: trace.hops.length,
    hops: completedHops.map((h, i) => ({
      step: i + 1, nodeId: h.nodeId, label: h.label,
      action: h.action, inMedium: h.inMedium, latencyMs: h.latencyMs, stages: h.stages || []
    }))
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trace-${trace.src}-to-${trace.dst}-${ts.slice(0, 19).replace(/:/g, '-')}.json`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const btn = (active, color = T.blue) => ({
  background: active ? color + '18' : 'transparent',
  color: active ? color : T.textMut,
  border: `1px solid ${active ? color + '44' : T.border}`,
  borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
  fontSize: 12, fontFamily: T.ui, fontWeight: 500, letterSpacing: 0,
  transition: 'all 0.15s',
})
const iconBtn = (color = T.textSec) => ({
  background: 'transparent', color, border: 'none',
  borderRadius: 4, padding: '3px 7px', cursor: 'pointer',
  fontSize: 15, fontFamily: T.ui, lineHeight: 1,
})
const ipInput = {
  background: 'transparent', border: 'none', outline: 'none',
  color: T.text, fontSize: 12, fontFamily: T.mono,
  width: 112, padding: '2px 4px',
}

export function Toolbar({ onTopologyLoad }) {
  const {
    mode, setMode, toggleAPIPanel, apiConnected, apiType,
    tracing, trace, traceStep, resetTrace, startTrace, topology,
    builderOpen, toggleBuilder,
    replaying, toggleReplay, stepBack, stepForward,
    traceConfig, setTraceConfig,
  } = useStore()

  const handleTrace = async () => {
    if (tracing) { resetTrace(); return }
    const nodes = topology?.nodes || []
    if (nodes.length < 2) return
    // Resolve IPs → node IDs (or use first/last as fallback)
    const srcNode = nodes.find(n => n.ip === traceConfig.srcIp) || nodes[0]
    const dstNode = nodes.find(n => n.ip === traceConfig.dstIp) || nodes[nodes.length - 1]
    const result = await runTrace(srcNode.id, dstNode.id, {
      protocol: traceConfig.protocol, port: traceConfig.port
    })
    startTrace(result)
  }

  const sep = <div style={{ width: 1, height: 22, background: T.border, flexShrink: 0 }} />

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: 'rgba(13,17,23,0.97)', borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
      zIndex: 50, backdropFilter: 'blur(12px)', fontFamily: T.ui,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke={T.blue} strokeWidth="1.5" />
          <circle cx="9" cy="9" r="3" fill={T.blue} opacity="0.7" />
          <line x1="9" y1="1" x2="9" y2="4" stroke={T.blue} strokeWidth="1.5" />
          <line x1="9" y1="14" x2="9" y2="17" stroke={T.blue} strokeWidth="1.5" />
          <line x1="1" y1="9" x2="4" y2="9" stroke={T.blue} strokeWidth="1.5" />
          <line x1="14" y1="9" x2="17" y2="9" stroke={T.blue} strokeWidth="1.5" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>
          Packet Follower
        </span>
      </div>

      {sep}

      {/* View mode */}
      <div style={{ display: 'flex', gap: 2, background: T.bg, borderRadius: 6, padding: 2, border: `1px solid ${T.border}` }}>
        {[['god', 'Overview'], ['follow', 'Follow Cam']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? T.panel : 'transparent',
            color: mode === m ? T.text : T.textMut,
            border: mode === m ? `1px solid ${T.border2}` : '1px solid transparent',
            borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
            fontSize: 11, fontFamily: T.ui, fontWeight: 500, transition: 'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {sep}

      {/* IP / Port form */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: T.panel, border: `1px solid ${T.border2}`,
        borderRadius: 6, padding: '0 10px', height: 32,
      }}>
        <input
          value={traceConfig.srcIp}
          onChange={e => setTraceConfig({ srcIp: e.target.value })}
          placeholder="Source IP"
          list="pf-node-ips"
          style={ipInput}
        />
        <span style={{ color: T.textMut, fontSize: 12, padding: '0 4px' }}>→</span>
        <input
          value={traceConfig.dstIp}
          onChange={e => setTraceConfig({ dstIp: e.target.value })}
          placeholder="Dest IP"
          list="pf-node-ips"
          style={ipInput}
        />
        <span style={{ color: T.border2, padding: '0 6px' }}>|</span>
        <select
          value={traceConfig.protocol}
          onChange={e => setTraceConfig({ protocol: e.target.value })}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: T.textSec, fontSize: 11, fontFamily: T.ui, cursor: 'pointer' }}
        >
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="ICMP">ICMP</option>
        </select>
        <span style={{ color: T.border2, padding: '0 6px' }}>:</span>
        <input
          value={traceConfig.port}
          onChange={e => setTraceConfig({ port: e.target.value })}
          placeholder="443"
          style={{ ...ipInput, width: 40, color: T.textSec }}
        />
        {/* autocomplete from topology */}
        <datalist id="pf-node-ips">
          {(topology?.nodes || []).map(n => (
            <option key={n.id} value={n.ip}>{n.label} — {n.ip}</option>
          ))}
        </datalist>
      </div>

      {/* Run / Stop trace */}
      <button onClick={handleTrace} style={{
        background: tracing ? T.red + '18' : T.green + '18',
        color: tracing ? T.red : T.green,
        border: `1px solid ${tracing ? T.red + '44' : T.green + '44'}`,
        borderRadius: 6, padding: '5px 16px', cursor: 'pointer',
        fontSize: 12, fontFamily: T.ui, fontWeight: 600,
      }}>
        {tracing ? '■ Stop' : '▶ Run Trace'}
      </button>

      {/* Playback controls — after trace completes */}
      {trace && !tracing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: T.panel, border: `1px solid ${T.border2}`,
          borderRadius: 6, padding: '3px 8px'
        }}>
          <button onClick={stepBack} disabled={traceStep <= 0}
            style={{ ...iconBtn(T.blue), opacity: traceStep <= 0 ? 0.3 : 1 }} title="Previous hop">⏮</button>
          <button onClick={toggleReplay}
            style={iconBtn(replaying ? T.orange : T.green)} title={replaying ? 'Pause' : 'Replay'}>
            {replaying ? '⏸' : '▶'}
          </button>
          <button onClick={stepForward} disabled={traceStep >= trace.hops.length - 1}
            style={{ ...iconBtn(T.blue), opacity: traceStep >= trace.hops.length - 1 ? 0.3 : 1 }} title="Next hop">⏭</button>
          <span style={{ fontSize: 11, color: T.textMut, minWidth: 36, textAlign: 'center', fontFamily: T.mono }}>
            {traceStep + 1}/{trace.hops.length}
          </span>
          <span style={{ color: T.border, padding: '0 2px' }}>|</span>
          <button onClick={() => saveTrace(trace, traceStep)} style={iconBtn(T.purple)} title="Save journey">💾</button>
          <button onClick={resetTrace} style={iconBtn(T.textMut)} title="Clear">↺</button>
        </div>
      )}

      {/* Demo DENY — only in mock mode */}
      {!tracing && !apiConnected && (
        <button
          onClick={() => { resetTrace(); setTimeout(() => startTrace(mockDenyTrace), 50) }}
          style={btn(false, T.red)}
          title="Demo: firewall deny trace"
        >⚠ Demo Deny</button>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Topology builder */}
        <button onClick={toggleBuilder} style={btn(builderOpen, T.purple)}>
          {builderOpen ? '✕ Builder' : '⊞ Builder'}
        </button>

        <button onClick={async () => { const topo = await fetchTopology(); onTopologyLoad(topo) }}
          style={btn(false)}>
          ↺ Reload
        </button>

        {sep}

        <span style={{ fontSize: 11, color: apiConnected ? T.green : T.textMut, fontFamily: T.mono }}>
          {apiConnected ? `● ${apiType}` : '○ demo'}
        </span>

        <button onClick={toggleAPIPanel} style={btn(false, T.blue)}>
          Connect API
        </button>
      </div>
    </div>
  )
}
