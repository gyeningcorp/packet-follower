import { GenericAdapter } from './generic.js'

// ThousandEyes adapter
// Docs: https://developer.cisco.com/docs/thousandeyes/
export class ThousandEyesAdapter extends GenericAdapter {
  constructor(config) {
    super({ ...config, baseUrl: 'https://api.thousandeyes.com/v7' })
  }

  async getTopology() {
    const res = await fetch(`${this.baseUrl}/network-topology`, { headers: this.headers })
    const data = await res.json()
    return this._normalizeTopology(data)
  }

  _normalizeTopology(raw) {
    const nodes = (raw.topology?.nodes || []).map(n => ({
      id: n.agentId || n.id,
      label: n.name,
      ip: n.publicIpAddress || n.ipAddresses?.[0],
      type: n.agentType === 'cloud' ? 'router' : 'endpoint',
      position: [Math.random() * 16 - 8, Math.random() * 4 - 2, 0]
    }))
    const links = (raw.topology?.links || []).map((l, i) => ({
      id: `te-link-${i}`,
      source: l.sourceId,
      target: l.targetId,
      latency: l.metrics?.latency,
      bandwidth: null
    }))
    return { nodes, links }
  }
}
