// Cisco Meraki Dashboard API adapter
// Docs: https://developer.cisco.com/meraki/api-v1/

import { inferDeviceType } from '../../utils/macOui.js'

export class MerakiAdapter {
  constructor(config) {
    this.baseUrl = 'https://api.meraki.com/api/v1'
    this.apiKey = config.apiKey
    this.orgId = config.orgId
    this.networkId = config.networkId
  }

  _headers() {
    return { 'X-Cisco-Meraki-API-Key': this.apiKey, 'Content-Type': 'application/json' }
  }

  async _get(path) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this._headers() })
    if (!res.ok) throw new Error(`Meraki API error: ${res.status}`)
    return res.json()
  }

  async _resolveOrgId() {
    if (this.orgId) return this.orgId
    const orgs = await this._get('/organizations')
    if (!orgs?.length) throw new Error('No Meraki organizations found')
    this.orgId = orgs[0].id
    return this.orgId
  }

  async getTopology() {
    const orgId = await this._resolveOrgId()

    const [devices, topo] = await Promise.all([
      this._get(`/organizations/${orgId}/devices`),
      this.networkId
        ? this._get(`/networks/${this.networkId}/topology/linkLayer`).catch(() => ({ nodes: [], links: [] }))
        : Promise.resolve({ nodes: [], links: [] })
    ])

    const nodes = (devices || []).map((d, i) => {
      const detected = inferDeviceType(d.mac, d.model || '')
      const col = i % 6, row = Math.floor(i / 6)
      return {
        id: d.serial,
        label: d.name || d.serial,
        ip: d.lanIp || d.wan1Ip,
        mac: d.mac,
        type: this._mapModel(d.model) || detected.type,
        vendor: 'Cisco Meraki',
        platform: d.model,
        software: d.firmware,
        position: [col * 3 - 8, -row * 3, 0]
      }
    })

    const links = (topo.links || []).map((l, i) => ({
      id: `meraki-link-${i}`,
      source: l.ends?.[0]?.device?.serial,
      target: l.ends?.[1]?.device?.serial,
      bandwidth: l.portSpeed,
      latency: null
    })).filter(l => l.source && l.target)

    return { nodes, links }
  }

  async trace(src, dst) {
    const orgId = await this._resolveOrgId()
    // Meraki live tools: packet capture / connectivity tests
    const res = await this._get(`/organizations/${orgId}/clients/search?mac=${encodeURIComponent(src)}`)
    return {
      src, dst, protocol: 'TCP',
      hops: [{ nodeId: src, action: 'ORIGIN', label: 'Meraki Trace', latencyMs: 0, stages: [
        { phase: 'NOTE', detail: 'Live path trace: use Meraki Dashboard → Tools → Packet Capture for deep trace' }
      ]}]
    }
  }

  _mapModel(model = '') {
    const m = model.toUpperCase()
    if (m.startsWith('MS'))  return 'switch'
    if (m.startsWith('MR'))  return 'wireless'
    if (m.startsWith('MX'))  return 'firewall'
    if (m.startsWith('MV'))  return 'endpoint'  // camera
    if (m.startsWith('MT'))  return 'endpoint'  // IoT sensor
    return 'unknown'
  }
}
