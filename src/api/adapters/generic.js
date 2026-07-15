// Generic REST adapter — connect any API that returns topology + trace data

export class GenericAdapter {
  constructor(config) {
    this.baseUrl = config.baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
      ...(config.headers || {})
    }
  }

  async getTopology() {
    const res = await fetch(`${this.baseUrl}/topology`, { headers: this.headers })
    if (!res.ok) throw new Error(`Topology fetch failed: ${res.status}`)
    const data = await res.json()
    return this._normalizeTopology(data)
  }

  async trace(src, dst, options = {}) {
    const res = await fetch(`${this.baseUrl}/trace`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ src, dst, protocol: options.protocol || 'TCP', port: options.port || 443 })
    })
    if (!res.ok) throw new Error(`Trace failed: ${res.status}`)
    return res.json()
  }

  // Override in subclasses to map vendor-specific schemas to PacketTrace format
  _normalizeTopology(raw) {
    return raw
  }
}
