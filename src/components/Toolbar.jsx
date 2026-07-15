import { useStore } from '../store/index.js'
import { fetchTopology, runTrace } from '../api/index.js'
import { mockDenyTrace } from '../data/mockTopology.js'

function saveTrace(trace, currentStep) {
  const ts = new Date().toISOString()
  const totalMs = trace.hops.reduce((sum, h) => sum + (h.latencyMs || 0), 0)
  const completedHops = trace.hops.slice(0, currentStep + 1)
  const payload = {
    savedAt: ts,
    src: trace.src,
    dst: trace.dst,
    protocol: trace.protocol || 'TCP',
    dstPort: trace.dstPort,
    status: currentStep >= trace.hops.length - 1 ? 'DELIVERED' : 'IN_PROGRESS',
    totalLatencyMs: totalMs,
    hopsRecorded: completedHops.length,
    hopsTotal: trace.hops.length,
    hops: completedHops.map((h, i) => ({
      step: i + 1,
      nodeId: h.nodeId,
      label: h.label,
      action: h.action,
      latencyMs: h.latencyMs,
      stages: h.stages || []
    }))
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trace-${trace.src}-to-${trace.dst}-${ts.slice(0, 19).replace(/:/g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const playBtn = (color) => ({
  background: 'transparent', color, border: 'none',
  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
  fontSize: 14, fontFamily: 'inherit', lineHeight: 1
})

export function Toolbar({ onTopologyLoad }) {
  const { mode, setMode, toggleAPIPanel, apiConnected, apiType,
          tracing, trace, traceStep, resetTrace, startTrace, topology,
          builderOpen, toggleBuilder,
          replaying, toggleReplay, stepBack, stepForward } = useStore()

  const handleTrace = async () => {
    if (tracing) { resetTrace(); return }
    const nodes = topology?.nodes || []
    if (nodes.length < 2) return
    const src = nodes[0].id
    const dst = nodes[nodes.length - 1].id
    const result = await runTrace(src, dst)
    startTrace(result)
  }

  const handleRefreshTopology = async () => {
    const topo = await fetchTopology()
    onTopologyLoad(topo)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: 'rgba(4,10,22,0.95)', borderBottom: '1px solid #0d2540',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      zIndex: 50, backdropFilter: 'blur(8px)',
      fontFamily: "'SF Mono', Consolas, monospace"
    }}>
      {/* Logo */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#00ccff', letterSpacing: 2, marginRight: 8 }}>
        ◈ PACKET FOLLOWER
      </div>

      <div style={{ width: 1, height: 24, background: '#0d2540' }} />

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, background: '#060f1e', borderRadius: 8, padding: 3, border: '1px solid #0d2540' }}>
        {['god', 'follow'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? '#00aaff22' : 'transparent',
            color: mode === m ? '#00ccff' : '#446',
            border: mode === m ? '1px solid #00aaff44' : '1px solid transparent',
            borderRadius: 6, padding: '4px 14px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'inherit', fontWeight: 700, letterSpacing: 1,
            transition: 'all 0.15s'
          }}>
            {m === 'god' ? '⊙ GOD VIEW' : '◎ FOLLOW CAM'}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: '#0d2540' }} />

      {/* Trace button */}
      <button onClick={handleTrace} style={{
        background: tracing ? '#ff222222' : '#00ff8822',
        color: tracing ? '#ff4455' : '#00ff88',
        border: `1px solid ${tracing ? '#ff224444' : '#00ff8844'}`,
        borderRadius: 8, padding: '6px 18px', cursor: 'pointer',
        fontSize: 12, fontFamily: 'inherit', fontWeight: 700, letterSpacing: 1
      }}>
        {tracing ? '■ STOP TRACE' : '▶ RUN TRACE'}
      </button>

      {/* Review playback controls — only appear after trace completes */}
      {trace && !tracing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#060f1e', border: '1px solid #0d2540', borderRadius: 10, padding: '3px 8px' }}>
          {/* Step back */}
          <button
            onClick={stepBack}
            disabled={traceStep <= 0}
            title="Previous hop"
            style={{ ...playBtn('#00aaff'), opacity: traceStep <= 0 ? 0.25 : 1 }}
          >⏮</button>

          {/* Auto-replay / pause */}
          <button
            onClick={toggleReplay}
            title={replaying ? 'Pause replay' : 'Auto-replay'}
            style={playBtn(replaying ? '#ffdd00' : '#00ff88')}
          >{replaying ? '⏸' : '▶'}</button>

          {/* Step forward */}
          <button
            onClick={stepForward}
            disabled={traceStep >= trace.hops.length - 1}
            title="Next hop"
            style={{ ...playBtn('#00aaff'), opacity: traceStep >= trace.hops.length - 1 ? 0.25 : 1 }}
          >⏭</button>

          {/* Hop counter */}
          <span style={{ fontSize: 10, color: '#334', minWidth: 36, textAlign: 'center' }}>
            {traceStep + 1}/{trace.hops.length}
          </span>

          {/* Save */}
          <button onClick={() => saveTrace(trace, traceStep)} title="Save journey" style={playBtn('#aa88ff')}>💾</button>

          {/* Reset */}
          <button onClick={resetTrace} title="Clear trace" style={playBtn('#ff9900')}>⟳</button>
        </div>
      )}

      {/* Demo: DENY trace — shows OSI L3 issue detection */}
      {!tracing && !apiConnected && (
        <button onClick={() => { resetTrace(); setTimeout(() => startTrace(mockDenyTrace), 50) }} style={{
          background: '#ff224411', color: '#ff4455',
          border: '1px solid #ff224433',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          fontSize: 11, fontFamily: 'inherit', fontWeight: 700
        }}>
          ⚠ DEMO DENY
        </button>
      )}

      {/* Refresh topology */}
      <button onClick={handleRefreshTopology} style={{
        background: 'transparent', color: '#446',
        border: '1px solid #0d2540',
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        fontSize: 12, fontFamily: 'inherit'
      }}>
        ↺ Topology
      </button>

      {/* Builder toggle */}
      <button onClick={toggleBuilder} style={{
        background: builderOpen ? '#aa88ff22' : 'transparent',
        color: builderOpen ? '#aa88ff' : '#446',
        border: `1px solid ${builderOpen ? '#aa88ff44' : '#0d2540'}`,
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        fontSize: 12, fontFamily: 'inherit', fontWeight: 700
      }}>
        ⊞ BUILDER
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* API status */}
        <div style={{ fontSize: 11, color: apiConnected ? '#00cc88' : '#334' }}>
          {apiConnected ? `● ${apiType.toUpperCase()}` : '○ DEMO MODE'}
        </div>

        <button onClick={toggleAPIPanel} style={{
          background: '#00aaff11', color: '#00aaff',
          border: '1px solid #00aaff33',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          fontSize: 11, fontFamily: 'inherit', fontWeight: 700
        }}>
          ⚡ CONNECT API
        </button>
      </div>
    </div>
  )
}
