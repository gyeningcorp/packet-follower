import { useState } from 'react'
import { useStore } from '../store/index.js'
import { OSI_LAYERS, PHASE_TO_LAYER, getActiveLayers, getAllVisitedLayers, detectIssueLayer, ISSUE_LABELS } from '../data/osiModel.js'

const T = {
  bg: '#0d1117', panel: '#161b22', border: '#21262d', border2: '#30363d',
  text: '#e6edf3', textSec: '#8b949e', textMut: '#484f58',
  blue: '#388bfd', green: '#3fb950', red: '#f85149', orange: '#d29922', purple: '#a371f7',
  ui: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', Consolas, monospace",
}

export function OSIPanel() {
  const { trace, traceStep, tracing, replaying, builderOpen } = useStore()
  const [expandedLayer, setExpandedLayer] = useState(null)

  if (builderOpen || !trace || traceStep < 0) return null

  const hop = trace.hops[traceStep]
  const stages = hop?.stages || []
  const activeLayers = getActiveLayers(stages)
  const visitedLayers = getAllVisitedLayers(trace.hops, traceStep)
  const hasIssue = hop?.action === 'DENY'
  const issueLayerNum = hasIssue ? detectIssueLayer(stages) : null

  const phasesByLayer = {}
  stages.forEach(s => {
    const l = PHASE_TO_LAYER[s.phase]
    if (!l) return
    if (!phasesByLayer[l]) phasesByLayer[l] = []
    phasesByLayer[l].push(s.phase)
  })

  const statusLabel = hasIssue
    ? `⚠ ${ISSUE_LABELS[issueLayerNum] || 'Issue detected'}`
    : tracing ? 'Live trace'
    : replaying ? 'Replaying'
    : 'Review mode'

  const statusColor = hasIssue ? T.red : tracing ? T.green : T.textSec

  return (
    <div style={{
      position: 'fixed', top: 52, left: 0, bottom: 0, width: 192,
      background: T.bg, borderRight: `1px solid ${T.border}`,
      fontFamily: T.ui, color: T.text, zIndex: 30,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.textMut, letterSpacing: 0.5, marginBottom: 3 }}>
          OSI MODEL
        </div>
        <div style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>{statusLabel}</div>
        {hasIssue && (
          <div style={{
            marginTop: 8, padding: '6px 8px',
            background: T.red + '12', border: `1px solid ${T.red}30`, borderRadius: 5,
            fontSize: 10, color: T.red, lineHeight: 1.5,
          }}>
            Drop at Layer {issueLayerNum}. Expand for CLI commands.
          </div>
        )}
      </div>

      {/* Layers L7 → L1 */}
      <div style={{ flex: 1, padding: '6px 0 12px' }}>
        {OSI_LAYERS.map(layer => {
          const isActive = activeLayers.has(layer.num)
          const isVisited = visitedLayers.has(layer.num)
          const isIssue = issueLayerNum === layer.num
          const isExpanded = expandedLayer === layer.num
          const layerPhases = phasesByLayer[layer.num] || []

          const accent = isIssue ? T.red : layer.color
          const textColor = isIssue ? T.red : isActive ? layer.color : isVisited ? layer.color + 'aa' : T.textMut

          return (
            <div
              key={layer.num}
              onClick={() => setExpandedLayer(isExpanded ? null : layer.num)}
              style={{
                padding: '7px 12px',
                borderLeft: `2px solid ${isIssue ? T.red : isActive ? layer.color : 'transparent'}`,
                background: isIssue ? T.red + '08' : isActive ? layer.color + '08' : 'transparent',
                marginBottom: 1, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                  background: isIssue ? T.red : isActive ? layer.color : isVisited ? layer.color + '22' : T.border,
                  color: isIssue || isActive ? '#0d1117' : isVisited ? layer.color : T.textMut,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.mono, transition: 'all 0.2s',
                }}>{layer.num}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: textColor }}>
                    {layer.shortName}
                  </div>
                  <div style={{ fontSize: 9, color: T.textMut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {layer.name}
                  </div>
                </div>
                {isIssue && <span style={{ fontSize: 11, color: T.red }}>⚠</span>}
                {isActive && !isIssue && <span style={{ fontSize: 9, color: layer.color }}>●</span>}
                {!isActive && !isIssue && isVisited && <span style={{ fontSize: 9, color: T.textMut }}>✓</span>}
              </div>

              {/* Active phase tags */}
              {layerPhases.length > 0 && (
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {layerPhases.map(p => (
                    <span key={p} style={{
                      fontSize: 9, padding: '1px 5px',
                      background: accent + '18', color: accent,
                      border: `1px solid ${accent}28`, borderRadius: 3,
                      fontWeight: 600, fontFamily: T.mono,
                    }}>{p}</span>
                  ))}
                </div>
              )}

              {/* Expanded issue list */}
              {(isExpanded || isIssue) && (
                <div style={{ marginTop: 7 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.textMut, letterSpacing: 0.5, marginBottom: 4 }}>
                    {isIssue ? 'CHECK FOR:' : 'COMMON ISSUES:'}
                  </div>
                  {layer.issues.map(issue => (
                    <div key={issue.id} style={{ marginBottom: 5 }}>
                      <div style={{ fontSize: 10, color: isIssue ? T.red + 'cc' : T.textMut, lineHeight: 1.4 }}>
                        {isIssue ? '⚠ ' : '· '}{issue.label}
                      </div>
                      <div style={{ fontSize: 9, color: isIssue ? T.red + '66' : T.textMut + '55', fontFamily: T.mono, marginTop: 1 }}>
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

      <div style={{ padding: '8px 12px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: T.textMut, lineHeight: 1.9 }}>
          ● active · ✓ visited · ⚠ issue<br />
          Click a layer to expand
        </div>
      </div>
    </div>
  )
}
