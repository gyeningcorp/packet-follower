// Extreme Networks ExtremeCloud IQ adapter
// Docs: https://api.extremecloudiq.com/

import { inferDeviceType } from '../../utils/macOui.js'

export class ExtremeAdapter {
  constructor(config) {
    this.baseUrl = 'https://api.extremecloudiq.com'
    this.apiKey = config.apiKey
  }

  _headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  async _get(path) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this._headers() })
    if (!res.ok) throw new Error(`ExtremeCloud IQ API error: ${res.status}`)
    return res.json()
  }

  async getTopology() {
    const devicesRes = await this._get('/devices?page=1&limit=100&async=false')
    const devices = devicesRes.data || []

    const nodes = devices.map((d, i) => {
      const detected = inferDeviceType(d.mac_address, d.product_type || '')
      const col = i % 5, row = Math.floor(i / 5)
      return {
        id: String(d.id),
        label: d.hostname || d.mac_address,
        ip: d.ip_address,
        mac: d.mac_address,
        type: this._mapDeviceFunction(d.device_function) || detected.type,
        vendor: 'Extreme',
        platform: d.product_type,
        software: d.software_version,
        position: [col * 3.5 - 8, -row * 3, 0]
      }
    })

    // ExtremeCloud IQ topology via network topology API
    let links = []
    try {
      const topoRes = await this._get('/network/topology')
      links = (topoRes.links || []).map((l, i) => ({
        id: `ex-link-${i}`,
        source: String(l.source_device_id),
        target: String(l.target_device_id),
        bandwidth: l.port_speed,
        latency: null
      }))
    } catch (_) {}

    return { nodes, links }
  }

  async trace(src, dst) {
    const res = await this._get(`/network/path-trace?src=${encodeURIComponent(src)}&dst=${encodeURIComponent(dst)}`)
    const hops = (res.hops || []).map(h => ({
      nodeId: String(h.device_id),
      action: 'FORWARD',
      label: h.hostname,
      latencyMs: h.latency_ms || 0,
      stages: [
        { phase: 'RECV', detail: `In port: ${h.ingress_port}` },
        { phase: 'FWD',  detail: `Out port: ${h.egress_port}` },
      ]
    }))
    return { src, dst, protocol: 'TCP', hops }
  }

  _mapDeviceFunction(fn = '') {
    const f = fn.toLowerCase()
    if (f.includes('switch'))   return 'switch'
    if (f.includes('router'))   return 'router'
    if (f.includes('ap') || f.includes('access')) return 'wireless'
    return 'switch'
  }
}
