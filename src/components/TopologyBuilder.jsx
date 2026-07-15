import { useState } from 'react'
import { useStore } from '../store/index.js'
import { DEVICE_COLORS } from './DeviceIcon.jsx'

const DEVICE_TYPES = [
  { type: 'switch',   label: 'Switch'   },
  { type: 'router',   label: 'Router'   },
  { type: 'firewall', label: 'Firewall' },
  { type: 'endpoint', label: 'Endpoint' },
  { type: 'server',   label: 'Server'   },
  { type: 'wireless', label: 'AP'       },
]

let nodeCounter = 100

export function TopologyBuilder({ open, onClose }) {
  const { topology, setTopology } = useStore()
  const [newNode, setNewNode] = useState({ type: 'switch', label: '', ip: '', mac: '' })
  const [linkSrc, setLinkSrc] = useState('')
  const [linkDst, setLinkDst] = useState('')
  const [linkMedium, setLinkMedium] = useState('copper')
  const [linkError, setLinkError] = useState(null)
  const [importError, setImportError] = useState(null)
  const [labelError, setLabelError] = useState(false)

  if (!open) return null

  const nodes = topology?.nodes || []
  const links = topology?.links || []

  const addNode = () => {
    if (!newNode.label) { setLabelError(true); return }
    setLabelError(false)
    const id = `node-${++nodeCounter}`
    const col = nodes.length % 5
    const row = Math.floor(nodes.length / 5)
    const updated = {
      ...topology,
      nodes: [...nodes, {
        id, type: newNode.type,
        label: newNode.label,
        ip: newNode.ip || '0.0.0.0',
        mac: newNode.mac || null,
        position: [col * 3.5 - 7, -row * 3, 0]
      }]
    }
    setTopology(updated)
    setNewNode({ type: 'switch', label: '', ip: '', mac: '' })
  }

  const removeNode = (id) => {
    setTopology({
      ...topology,
      nodes: nodes.filter(n => n.id !== id),
      links: links.filter(l => l.source !== id && l.target !== id)
    })
  }

  const addLink = () => {
    if (!linkSrc || !linkDst) { setLinkError('Select both a source and destination device.'); return }
    if (linkSrc === linkDst) { setLinkError('Source and destination must be different devices.'); return }
    const id = `link-${linkSrc}-${linkDst}`
    if (links.find(l => l.id === id)) { setLinkError('A link between these devices already exists.'); return }
    setLinkError(null)
    setTopology({ ...topology, links: [...links, { id, source: linkSrc, target: linkDst, bandwidth: '1G', latency: 1, medium: linkMedium }] })
    setLinkSrc(''); setLinkDst(''); setLinkMedium('copper')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.nodes || !data.links) throw new Error('JSON must have "nodes" and "links" arrays')
        setTopology(data)
        setImportError(null)
      } catch (err) {
        setImportError(err.message)
      }
    }
    reader.readAsText(file)
  }

  const exportTopology = () => {
    const blob = new Blob([JSON.stringify(topology, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'topology.json'
    a.click()
  }

  return (
    <div style={{
      position: 'fixed', top: 52, left: 0, bottom: 0, width: 320,
      background: 'rgba(4,10,22,0.97)', borderRight: '1px solid #0d2540',
      fontFamily: "'SF Mono', Consolas, monospace", color: '#c8dff0',
      display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto'
    }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #0d2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#00ccff', letterSpacing: 1.5 }}>TOPOLOGY BUILDER</span>
        <button onClick={onClose} style={btnSm('#334')}>✕</button>
      </div>

      {/* Import / Export */}
      <section style={section}>
        <div style={sectionTitle}>IMPORT / EXPORT</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ ...btnSm('#00aaff', true), cursor: 'pointer', flex: 1, textAlign: 'center' }}>
            ↑ Import JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button onClick={exportTopology} style={{ ...btnSm('#00cc88', true), flex: 1 }}>↓ Export JSON</button>
        </div>
        {importError && <div style={{ color: '#ff4455', fontSize: 11, marginTop: 6 }}>⚠ {importError}</div>}
        <div style={{ fontSize: 10, color: '#334', marginTop: 6 }}>
          JSON format: {'{ "nodes": [...], "links": [...] }'}
        </div>
      </section>

      {/* Add Device */}
      <section style={section}>
        <div style={sectionTitle}>ADD DEVICE</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {DEVICE_TYPES.map(d => (
            <button key={d.type} onClick={() => setNewNode(n => ({ ...n, type: d.type }))} style={{
              background: newNode.type === d.type ? DEVICE_COLORS[d.type] + '22' : 'transparent',
              color: newNode.type === d.type ? DEVICE_COLORS[d.type] : '#446',
              border: `1px solid ${newNode.type === d.type ? DEVICE_COLORS[d.type] + '55' : '#0d2540'}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontSize: 11, fontFamily: 'inherit', fontWeight: 700
            }}>{d.label}</button>
          ))}
        </div>
        <Field
          label="LABEL *"
          value={newNode.label}
          onChange={v => { setNewNode(n => ({ ...n, label: v })); setLabelError(false) }}
          placeholder="SW-CORE-01"
          error={labelError}
        />
        <Field label="IP ADDRESS" value={newNode.ip} onChange={v => setNewNode(n => ({ ...n, ip: v }))} placeholder="192.168.1.1" />
        <Field label="MAC ADDRESS" value={newNode.mac} onChange={v => setNewNode(n => ({ ...n, mac: v }))} placeholder="aa:bb:cc:dd:ee:ff" />
        <button onClick={addNode} style={{ ...btnSm('#00ff88', true), width: '100%', marginTop: 8 }}>+ Add Device</button>
      </section>

      {/* Add Link */}
      <section style={section}>
        <div style={sectionTitle}>ADD LINK</div>
        {nodes.length < 2 && (
          <div style={{ fontSize: 10, color: '#446', marginBottom: 8 }}>
            ⚠ Add at least 2 devices first.
          </div>
        )}
        <select
          value={linkSrc}
          onChange={e => { setLinkSrc(e.target.value); setLinkError(null) }}
          style={{ ...selectStyle, border: `1px solid ${linkError && !linkSrc ? '#ff4455' : '#0d2540'}` }}
        >
          <option value="">Source device...</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        <select
          value={linkDst}
          onChange={e => { setLinkDst(e.target.value); setLinkError(null) }}
          style={{ ...selectStyle, marginTop: 6, border: `1px solid ${linkError && !linkDst ? '#ff4455' : '#0d2540'}` }}
        >
          <option value="">Destination device...</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[
            { val: 'copper',   label: '◉ Copper',   color: '#ffaa44' },
            { val: 'fiber',    label: '◈ Fiber',    color: '#00eeff' },
            { val: 'wireless', label: '◎ Wireless', color: '#cc99ff' },
          ].map(m => (
            <button key={m.val} onClick={() => setLinkMedium(m.val)} style={{
              flex: 1, background: linkMedium === m.val ? m.color + '22' : 'transparent',
              color: linkMedium === m.val ? m.color : '#446',
              border: `1px solid ${linkMedium === m.val ? m.color + '55' : '#0d2540'}`,
              borderRadius: 6, padding: '4px 0', cursor: 'pointer',
              fontSize: 10, fontFamily: 'inherit', fontWeight: 700
            }}>{m.label}</button>
          ))}
        </div>
        <button onClick={addLink} style={{ ...btnSm('#ff9900', true), width: '100%', marginTop: 8 }}>+ Add Link</button>
        {linkError && <div style={{ fontSize: 9, color: '#ff4455', marginTop: 5 }}>⚠ {linkError}</div>}
      </section>

      {/* Device list */}
      <section style={{ ...section, flex: 1 }}>
        <div style={sectionTitle}>DEVICES ({nodes.length})</div>
        {nodes.map(n => (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
            borderBottom: '1px solid #0a1828'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEVICE_COLORS[n.type] || '#667', flexShrink: 0 }} />
            <span style={{ fontSize: 11, flex: 1, color: '#aac' }}>{n.label}</span>
            <span style={{ fontSize: 10, color: '#446' }}>{n.ip}</span>
            <button onClick={() => removeNode(n.id)} style={{ ...btnSm('#ff4455'), padding: '2px 6px', fontSize: 10 }}>✕</button>
          </div>
        ))}
        {!nodes.length && <div style={{ fontSize: 11, color: '#334', marginTop: 8 }}>No devices yet.</div>}
      </section>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, error }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ display: 'block', fontSize: 9, color: error ? '#ff4455' : '#557', letterSpacing: 1.5, marginBottom: 3, fontWeight: 700 }}>
        {label}{error && ' — required'}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#060f1e',
          border: `1px solid ${error ? '#ff4455' : '#0d2540'}`,
          borderRadius: 5, padding: '6px 8px', color: '#c8dff0',
          fontSize: 11, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
        }}
      />
      {error && <div style={{ fontSize: 9, color: '#ff4455', marginTop: 3 }}>⚠ Enter a label before adding</div>}
    </div>
  )
}

const section = { padding: '14px 18px', borderBottom: '1px solid #0a1828' }
const sectionTitle = { fontSize: 9, fontWeight: 700, color: '#334', letterSpacing: 2, marginBottom: 10 }
const selectStyle = { width: '100%', background: '#060f1e', border: '1px solid #0d2540', borderRadius: 5, padding: '6px 8px', color: '#c8dff0', fontSize: 11, fontFamily: 'inherit', outline: 'none' }
const btnSm = (color, primary) => ({
  background: primary ? color + '18' : 'transparent',
  color: primary ? color : '#446',
  border: `1px solid ${color}33`, borderRadius: 6,
  padding: primary ? '7px 12px' : '4px 8px',
  cursor: 'pointer', fontSize: 11,
  fontFamily: 'inherit', fontWeight: 700
})
