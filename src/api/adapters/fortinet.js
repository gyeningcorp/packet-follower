// Fortinet FortiManager REST API adapter
// Docs: https://fndn.fortinet.net/index.php?/fortiapi/

import { inferDeviceType } from '../../utils/macOui.js'

export class FortinetAdapter {
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.adom = config.adom || 'root'
  }

  _headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  async _post(method, params) {
    const res = await fetch(`${this.baseUrl}/jsonrpc`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ id: 1, method, params, session: this.apiKey })
    })
    if (!res.ok) throw new Error(`FortiManager API error: ${res.status}`)
    const data = await res.json()
    if (data.result?.[0]?.status?.code !== 0) {
      throw new Error(`FortiManager: ${data.result?.[0]?.status?.message}`)
    }
    return data.result?.[0]?.data
  }

  async getTopology() {
    const devices = await this._post('get', [{
      url: `/dvmdb/adom/${this.adom}/device`,
      option: ['get flags', 'extra info']
    }])

    const nodes = (devices || []).map((d, i) => {
      const detected = inferDeviceType(d.mgmt_id, d.os_type || '')
      const col = i % 5, row = Math.floor(i / 5)
      return {
        id: d.name,
        label: d.name,
        ip: d.ip,
        mac: d.mgmt_id,
        type: this._mapOsType(d.os_type) || detected.type,
        vendor: 'Fortinet',
        platform: d.platform_str,
        software: d.os_ver,
        position: [col * 3.5 - 7, -row * 3, 0]
      }
    })

    // FortiManager topology links via interface map
    let links = []
    try {
      const topo = await this._post('get', [{ url: `/dvmdb/adom/${this.adom}/device/topology` }])
      links = (topo?.links || []).map((l, i) => ({
        id: `fm-link-${i}`,
        source: l.src_dev,
        target: l.dst_dev,
        bandwidth: l.bandwidth,
        latency: null
      }))
    } catch (_) { /* topology endpoint optional */ }

    return { nodes, links }
  }

  async trace(src, dst) {
    // FortiManager doesn't have a native path trace — use diagnostic tool
    const result = await this._post('exec', [{
      url: `/dvmdb/adom/${this.adom}/task`,
      data: { cmd: `diagnose netlink neighbor list`, device: src }
    }])
    // Return minimal trace — full path trace requires FortiAnalyzer
    return {
      src, dst, protocol: 'TCP',
      hops: [{ nodeId: src, action: 'ORIGIN', label: 'Fortinet Source', latencyMs: 0, stages: [
        { phase: 'NOTE', detail: 'Full path trace requires FortiAnalyzer integration' }
      ]}]
    }
  }

  _mapOsType(osType = '') {
    const t = String(osType).toLowerCase()
    if (t.includes('fgt') || t.includes('fortigate')) return 'firewall'
    if (t.includes('fsw') || t.includes('fortiswitch')) return 'switch'
    if (t.includes('fap') || t.includes('fortiap'))    return 'wireless'
    return 'firewall'
  }
}
