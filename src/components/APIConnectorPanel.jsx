import { useState } from 'react'
import { useStore } from '../store/index.js'
import { connectAPI, ADAPTERS } from '../api/index.js'

const ADAPTER_FIELDS = {
  snmp:            ['agentUrl', 'community', 'seedDevice'],
  catalyst_center: ['baseUrl', 'username', 'password'],
  meraki:          ['apiKey', 'orgId', 'networkId'],
  fortinet:        ['baseUrl', 'apiKey', 'adom'],
  extreme:         ['apiKey'],
  thousandeyes:    ['baseUrl', 'apiKey'],
  generic:         ['baseUrl', 'apiKey'],
}

const FIELD_META = {
  baseUrl:    { label: 'API BASE URL',        placeholder: 'https://your-server/api', secret: false },
  apiKey:     { label: 'API KEY / TOKEN',      placeholder: 'sk-... or Bearer token',  secret: true  },
  agentUrl:   { label: 'LOCAL AGENT URL',      placeholder: 'http://localhost:7474',   secret: false },
  community:  { label: 'SNMP COMMUNITY',       placeholder: 'public',                  secret: false },
  seedDevice: { label: 'SEED DEVICE IP',       placeholder: '192.168.1.1',             secret: false },
  username:   { label: 'USERNAME',             placeholder: 'admin',                   secret: false },
  password:   { label: 'PASSWORD',             placeholder: '••••••••',                secret: true  },
  orgId:      { label: 'ORG ID (optional)',     placeholder: 'auto-detected',           secret: false },
  networkId:  { label: 'NETWORK ID (optional)',placeholder: 'L_123...',                secret: false },
  adom:       { label: 'ADOM',                 placeholder: 'root',                    secret: false },
}

export function APIConnectorPanel() {
  const { apiPanelOpen, toggleAPIPanel, setAPIConnected, apiConnected, apiType } = useStore()
  const [type, setType] = useState('mock')
  const [fields, setFields] = useState({ baseUrl: '', apiKey: '', agentUrl: 'http://localhost:7474', community: 'public', seedDevice: '', username: '', password: '', orgId: '', networkId: '', adom: 'root' })
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)

  if (!apiPanelOpen) return null

  const activeFields = ADAPTER_FIELDS[type] || []

  const connect = async () => {
    setTesting(true); setError(null)
    try {
      connectAPI(type, fields)
      setAPIConnected(type)
    } catch (e) {
      setError(e.message)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 52, right: 0, bottom: 0, width: 370,
      background: 'rgba(4,12,24,0.97)', borderLeft: '1px solid #1a3a5c',
      padding: 24, zIndex: 100, fontFamily: "'SF Mono', Consolas, monospace",
      color: '#c8dff0', display: 'flex', flexDirection: 'column', gap: 16,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#00ccff', letterSpacing: 1.5 }}>CONNECT DATA SOURCE</span>
        <button onClick={toggleAPIPanel} style={btnStyle('#334')}>✕</button>
      </div>

      {apiConnected && (
        <div style={{ background: '#00cc8818', border: '1px solid #00cc8840', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#00cc88' }}>
          ● Connected via <strong>{ADAPTERS[apiType]}</strong>
        </div>
      )}

      <div>
        <label style={labelStyle}>DATA SOURCE</label>
        <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
          {Object.entries(ADAPTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Dynamic fields per adapter */}
      {activeFields.map(f => {
        const meta = FIELD_META[f]
        return (
          <div key={f}>
            <label style={labelStyle}>{meta.label}</label>
            <input
              type={meta.secret ? 'password' : 'text'}
              value={fields[f] || ''}
              onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
              placeholder={meta.placeholder}
              style={inputStyle}
            />
          </div>
        )
      })}

      {type === 'mock' && (
        <div style={{ fontSize: 12, color: '#445', lineHeight: 1.8 }}>
          Runs with a built-in 6-node topology (PC → Switch → Dist → Firewall → Router → Server). No credentials needed.
        </div>
      )}

      {/* Help text per adapter */}
      {type === 'snmp' && (
        <div style={{ fontSize: 11, color: '#334', lineHeight: 1.7 }}>
          Start the local agent first:<br />
          <code style={{ color: '#446' }}>npx packet-follower-agent --seed {fields.seedDevice || '192.168.1.1'}</code>
        </div>
      )}
      {type === 'catalyst_center' && (
        <div style={{ fontSize: 11, color: '#334', lineHeight: 1.7 }}>
          Base URL: <code style={{ color: '#446' }}>https://your-dnac-ip</code><br />
          Requires ROLE_OBSERVER or higher.
        </div>
      )}
      {type === 'meraki' && (
        <div style={{ fontSize: 11, color: '#334', lineHeight: 1.7 }}>
          API key from: Meraki Dashboard → Admin → API access<br />
          Org ID auto-detected if blank.
        </div>
      )}
      {type === 'fortinet' && (
        <div style={{ fontSize: 11, color: '#334', lineHeight: 1.7 }}>
          Base URL: <code style={{ color: '#446' }}>https://your-fortimanager</code><br />
          API key from: FortiManager → Admin → API Users
        </div>
      )}
      {type === 'extreme' && (
        <div style={{ fontSize: 11, color: '#334', lineHeight: 1.7 }}>
          API key from: ExtremeCloud IQ → Global Settings → API Token
        </div>
      )}

      {error && <div style={{ color: '#ff4455', fontSize: 12 }}>⚠ {error}</div>}

      <button onClick={connect} disabled={testing} style={btnStyle('#00aaff', true)}>
        {testing ? 'Connecting...' : type === 'mock' ? 'Load Demo Topology' : '⚡ Connect'}
      </button>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 10, color: '#557', letterSpacing: 1.5, marginBottom: 5, fontWeight: 700 }
const inputStyle = { width: '100%', background: '#0a1828', border: '1px solid #1a3a5c', borderRadius: 6, padding: '8px 10px', color: '#c8dff0', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const btnStyle = (color, primary) => ({
  background: primary ? color + '22' : 'transparent',
  color: primary ? color : '#667',
  border: `1px solid ${color}55`, borderRadius: 8,
  padding: primary ? '10px 0' : '6px 12px',
  cursor: 'pointer', width: primary ? '100%' : 'auto',
  fontSize: primary ? 13 : 12, fontFamily: 'inherit', fontWeight: 700, letterSpacing: primary ? 1 : 0
})
