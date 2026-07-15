// SNMP adapter — talks to the PacketTrace backend agent running locally
// The backend agent runs snmpwalk/CDP/LLDP and exposes a local REST API
// Run: npx packet-follower-agent --community public --seed 192.168.1.1

export class SNMPAdapter {
  constructor(config) {
    this.agentUrl = config.agentUrl || 'http://localhost:7474'
    this.community = config.community || 'public'
    this.seedDevice = config.seedDevice
  }

  async discover() {
    const res = await fetch(`${this.agentUrl}/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: this.seedDevice, community: this.community })
    })
    if (!res.ok) throw new Error(`Discovery failed: ${res.status}`)
    return res.json()
  }

  async getTopology() {
    const res = await fetch(`${this.agentUrl}/topology`)
    if (!res.ok) throw new Error(`SNMP topology fetch failed: ${res.status}`)
    return res.json()
  }

  async trace(src, dst, options = {}) {
    const res = await fetch(`${this.agentUrl}/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src, dst, ...options })
    })
    if (!res.ok) throw new Error(`Trace failed: ${res.status}`)
    return res.json()
  }
}
