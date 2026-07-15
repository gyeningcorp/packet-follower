import { useState } from 'react'
import { useStore } from '../store/index.js'
import { connectAPI, ADAPTERS } from '../api/index.js'

export function APIConnectorPanel() {
  const { apiPanelOpen, toggleAPIPanel, setAPIConnected, apiConnected, apiType } = useStore()
  const [type, setType] = useState('mock')
  const [fields, setFields] = useState({ baseUrl: '', apiKey: '', agentUrl: 'http://localhost:7474', community: 'public', seedDevice: '' })
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)

  const connect = async () => {
    setTesting(true)
    setError(null)
    try {
      connectAPI(type, fields)
      setAPIConnected(type)
    } catch (e) {
      setError(e.message)
    } finally {
      setTesting(false)
    }
  }

  if (!apiPanelOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
      background: 'rgba(4,12,24,0.97)', borderLeft: '1px solid #1a3a5c',
      padding: 28, zIndex: 100, fontFamily: "'SF Mono', Consolas, monospace",
      color: '#c8dff0', display: 'flex', flexDirection: 'column', gap: 18,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#00ccff', letterSpacing: 1 }}>API CONNECTOR</span>
        <button onClick={toggleAPIPanel} style={btnStyle('#334')}>✕</button>
      </div>

      {apiConnected && (
        <div style={{ background: '#00cc8822', border: '1px solid #00cc8855', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#00cc88' }}>
          ● Connected via <strong>{ADAPTERS[apiType]}</strong>
        </div>
      )}

      <div>
        <label style={labelStyle}>DATA SOURCE</label>
        <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
          {Object.entries(ADAPTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {type === 'snmp' && <>
        <Field label="LOCAL AGENT URL" value={fields.agentUrl} onChange={v => setFields(f => ({ ...f, agentUrl: v }))} placeholder="http://localhost:7474" />
        <Field label="SNMP COMMUNITY" value={fields.community} onChange={v => setFields(f => ({ ...f, community: v }))} placeholder="public" />
        <Field label="SEED DEVICE IP" value={fields.seedDevice} onChange={v => setFields(f => ({ ...f, seedDevice: v }))} placeholder="192.168.1.1" />
      </>}

      {(type === 'generic' || type === 'thousandeyes') && <>
        <Field label="API BASE URL" value={fields.baseUrl} onChange={v => setFields(f => ({ ...f, baseUrl: v }))} placeholder="https://api.example.com/v1" />
        <Field label="API KEY / BEARER TOKEN" value={fields.apiKey} onChange={v => setFields(f => ({ ...f, apiKey: v }))} placeholder="sk-..." secret />
      </>}

      {type === 'mock' && (
        <div style={{ fontSize: 12, color: '#556', lineHeight: 1.7 }}>
          Uses built-in demo topology — 6 nodes (PC → Switch → Dist → FW → Router → Server). No external connection needed.
        </div>
      )}

      {error && <div style={{ color: '#ff4455', fontSize: 12 }}>⚠ {error}</div>}

      <button onClick={connect} disabled={testing} style={btnStyle('#00aaff', true)}>
        {testing ? 'Connecting...' : type === 'mock' ? 'Use Demo Data' : 'Connect'}
      </button>

      <div style={{ marginTop: 'auto', fontSize: 11, color: '#334', lineHeight: 1.7 }}>
        For SNMP, run the local agent:<br />
        <code style={{ color: '#556' }}>npx packet-follower-agent --seed 192.168.1.1</code>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, secret }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={secret ? 'password' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 10, color: '#557', letterSpacing: 1.5, marginBottom: 6, fontWeight: 700 }
const inputStyle = { width: '100%', background: '#0a1828', border: '1px solid #1a3a5c', borderRadius: 6, padding: '8px 10px', color: '#c8dff0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
const btnStyle = (color, primary) => ({
  background: primary ? color + '22' : 'transparent',
  color: primary ? color : '#667',
  border: `1px solid ${color}55`,
  borderRadius: 8, padding: primary ? '10px 0' : '6px 12px',
  cursor: 'pointer', width: primary ? '100%' : 'auto',
  fontSize: primary ? 13 : 12, fontFamily: 'inherit', fontWeight: 700,
  letterSpacing: primary ? 1 : 0
})
