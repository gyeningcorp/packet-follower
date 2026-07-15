// Cisco Catalyst Center (formerly DNA Center) adapter
// Docs: https://developer.cisco.com/docs/dna-center/

import { inferDeviceType } from '../../utils/macOui.js'

export class CatalystCenterAdapter {
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.username = config.username
    this.password = config.password
    this.token = null
  }

  async _auth() {
    const res = await fetch(`${this.baseUrl}/dna/system/api/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`Catalyst Center auth failed: ${res.status}`)
    const data = await res.json()
    this.token = data.Token
  }

  async _get(path) {
    if (!this.token) await this._auth()
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'X-Auth-Token': this.token, 'Content-Type': 'application/json' }
    })
    if (res.status === 401) { this.token = null; return this._get(path) }
    if (!res.ok) throw new Error(`Catalyst Center API error: ${res.status}`)
    return res.json()
  }

  async getTopology() {
    const [devicesRes, topoRes] = await Promise.all([
      this._get('/dna/intent/api/v1/network-device?limit=500'),
      this._get('/dna/intent/api/v1/topology/physical-topology')
    ])

    const devices = devicesRes.response || []
    const topoNodes = topoRes.response?.nodes || []
    const topoLinks = topoRes.response?.links || []

    // Position nodes in a grid if no layout from API
    const nodes = devices.map((d, i) => {
      const detected = inferDeviceType(d.macAddress, d.softwareDescription || d.platformId || '')
      const col = i % 6, row = Math.floor(i / 6)
      return {
        id: d.id,
        label: d.hostname || d.managementIpAddress,
        ip: d.managementIpAddress,
        mac: d.macAddress,
        type: this._mapDeviceFamily(d.family) || detected.type,
        vendor: d.vendor || detected.vendor,
        platform: d.platformId,
        software: d.softwareVersion,
        position: [col * 3.5 - 9, -row * 3, 0]
      }
    })

    const links = topoLinks.map((l, i) => ({
      id: `cc-link-${i}`,
      source: l.source,
      target: l.target,
      bandwidth: l.linkStatus,
      latency: null
    }))

    return { nodes, links }
  }

  async trace(srcIp, dstIp) {
    const res = await this._get(`/dna/intent/api/v1/flow-analysis?sourceIP=${srcIp}&destIP=${dstIp}`)
    // Catalyst Center path trace is async — poll for result
    const taskId = res.response?.flowAnalysisId
    if (!taskId) throw new Error('No flow analysis ID returned')

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1500))
      const result = await this._get(`/dna/intent/api/v1/flow-analysis/${taskId}`)
      if (result.response?.request?.status === 'COMPLETED') {
        return this._normalizeTrace(result.response)
      }
    }
    throw new Error('Path trace timed out')
  }

  _normalizeTrace(raw) {
    const hops = (raw.networkElementsInfo || []).map(h => ({
      nodeId: h.id,
      action: h.type === 'WIRELESS' ? 'FORWARD' : 'ROUTE',
      label: h.name,
      latencyMs: h.perfMonStatistics?.rtpJitterMin || 0,
      stages: [
        { phase: 'RECV',  detail: `In: ${h.ingressInterface?.physicalInterface?.name || 'unknown'}` },
        { phase: 'FWD',   detail: `Out: ${h.egressInterface?.physicalInterface?.name || 'unknown'}` },
      ]
    }))
    return { src: raw.request?.sourceIP, dst: raw.request?.destIP, protocol: 'TCP', hops }
  }

  _mapDeviceFamily(family = '') {
    const f = family.toLowerCase()
    if (f.includes('switch'))   return 'switch'
    if (f.includes('router'))   return 'router'
    if (f.includes('firewall')) return 'firewall'
    if (f.includes('wireless') || f.includes('access point')) return 'wireless'
    if (f.includes('server'))   return 'server'
    return 'unknown'
  }
}
