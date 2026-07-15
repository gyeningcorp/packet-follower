import { useState } from 'react'
import { useStore } from '../store/index.js'
import {
  OSI_LAYERS,
  PHASE_TO_LAYER,
  getActiveLayers,
  getAllVisitedLayers,
  detectIssueLayer,
  ISSUE_LABELS,
} from '../data/osiModel.js'

export function OSIPanel() {
  const { trace, traceStep, tracing, paused, builderOpen } = useStore()
  const [expandedLayer, setExpandedLayer] = useState(null)

  const visible = !builderOpen && trace && traceStep >= 0
  if (!visible) return null

  const hop = trace.hops[traceStep]
  const stages = hop?.stages || []
  const activeLayers = getActiveLayers(stages)
  const visitedLayers = getAllVisitedLayers(trace.hops, traceStep)

  const hasIssue = hop?.action === 'DENY'
  const issueLayerNum = hasIssue ? detectIssueLayer(stages) : null

  // Group phases by layer for the active hop
  const phasesByLayer = {}
  stages.forEach(s => {
    const l = PHASE_TO_LAYER[s.phase]
    if (!l) return
    if (!phasesByLayer[l]) phasesByLayer[l] = []
    phasesByLayer[l].push(s.phase)
  })

  const status = hasIssue
    ? `⚠ ISSUE — ${ISSUE_LABELS[issueLayerNum] || 'Unknown layer'}`
    : tracing
    ? '● LIVE TRACE'
    : paused
    ? '⏸ PAUSED'
    : '✓ COMPLETE'

  const statusColor = hasIssue ? '#ff4455' : tracing ? '#00ff88' : paused ? '#ffdd00' : '#00aaff'

  return (
    <div style={{
      position: 'fixed', top: 52, left: 0, bottom: 0, width: 190,
      background: 'rgba(3,9,20,0.97)', borderRight: '1px solid #0d2540',
      fontFamily: "'SF Mono', Consolas, monospace", color: '#c8dff0',
      zIndex: 30, display: 'flex', flexDirection: 'column', overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #0d2540', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#334', letterSpacing: 2, marginBottom: 4 }}>
          OSI MODEL
        </div>
        <div style={{ fontSize: 10, color: statusColor, fontWeight: 700 }}>{status}</div>
        {hasIssue && (
          <div style={{
            marginTop: 8, padding: '6px 8px',
            background: '#ff224410', border: '1px solid #ff224433', borderRadius: 6,
            fontSize: 9, color: '#ff4455', lineHeight: 1.6
          }}>
            Packet dropped at L{issueLayerNum}.<br />
            Check commands below ↓
          </div>
        )}
      </div>

      {/* Layers — L7 at top, L1 at bottom (standard OSI orientation) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 0 12px' }}>
        {OSI_LAYERS.map(layer => {
          const isActive = activeLayers.has(layer.num)
          const isVisited = visitedLayers.has(layer.num)
          const isIssue = issueLayerNum === layer.num
          const isExpanded = expandedLayer === layer.num
          const layerPhases = phasesByLayer[layer.num] || []

          const borderColor = isIssue ? '#ff2244' : isActive ? layer.color : 'transparent'
          const bgColor = isIssue ? '#ff224408' : isActive ? layer.color + '0d' : isVisited ? layer.color + '05' : 'transparent'
          const numBg = isIssue ? '#ff2244' : isActive ? layer.color : isVisited ? layer.color + '22' : '#0d2540'
          const numColor = isIssue || isActive ? '#000814' : isVisited ? layer.color : '#334'
          const nameColor = isIssue ? '#ff4455' : isActive ? layer.color : isVisited ? layer.color + 'aa' : '#334'

          return (
            <div
              key={layer.num}
              onClick={() => setExpandedLayer(isExpanded ? null : layer.num)}
              style={{
                padding: '7px 12px',
                borderLeft: `3px solid ${borderColor}`,
                background: bgColor,
                marginBottom: 1,
                cursor: 'pointer',
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              {/* Layer row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                  background: numBg, color: numColor,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s'
                }}>
                  {layer.num}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: nameColor, letterSpacing: 0.5 }}>
                    {layer.shortName}
                  </div>
                  <div style={{ fontSize: 8, color: '#1e3a50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {layer.name}
                  </div>
                </div>
                {isIssue && <span style={{ fontSize: 12, color: '#ff2244' }}>⚠</span>}
                {isActive && !isIssue && <span style={{ fontSize: 8, color: layer.color }}>●</span>}
                {!isActive && !isIssue && isVisited && <span style={{ fontSize: 8, color: layer.color + '55' }}>✓</span>}
              </div>

              {/* Active phases at this layer */}
              {layerPhases.length > 0 && (
                <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {layerPhases.map(p => (
                    <span key={p} style={{
                      fontSize: 8, padding: '1px 5px',
                      background: isIssue ? '#ff224422' : layer.color + '20',
                      color: isIssue ? '#ff6677' : layer.color,
                      borderRadius: 3, fontWeight: 700, letterSpacing: 0.5
                    }}>{p}</span>
                  ))}
                </div>
              )}

              {/* Expanded: issues + show commands */}
              {(isExpanded || isIssue) && (
                <div style={{ marginTop: 7 }}>
                  <div style={{ fontSize: 8, color: '#334', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>
                    {isIssue ? '⚠ CHECK FOR:' : 'COMMON ISSUES:'}
                  </div>
                  {layer.issues.map(issue => (
                    <div key={issue.id} style={{ marginBottom: 5 }}>
                      <div style={{ fontSize: 9, color: isIssue ? '#ff6677' : '#446', lineHeight: 1.4 }}>
                        {isIssue ? '⚠' : '·'} {issue.label}
                      </div>
                      <div style={{
                        fontSize: 8, color: isIssue ? '#ff224488' : '#1a2a3a',
                        fontFamily: "'SF Mono', Consolas, monospace", marginTop: 1
                      }}>
                        {issue.cmd}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer legend */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #0a1828', flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: '#1a2a3a', lineHeight: 1.8 }}>
          ● active this hop<br />
          ✓ passed earlier<br />
          ⚠ issue detected<br />
          tap layer to expand
        </div>
      </div>
    </div>
  )
}
