# Packet Follower

**Watch your network traffic in real time — follow every packet from source to destination.**

Packet Follower is a 3D network visualization tool for production environments. Connect it to your real network infrastructure and watch live traffic flow through your topology as animated orbs — hop by hop, with full protocol detail at every node.

---

## What It Does

- **Follow Cam** — run a trace and the camera locks onto the packet and rides with it across your network
- **God View** — overhead 3D view of your entire topology with live traffic flowing across all links simultaneously
- **Hop Detail** — at every hop: interface, IP, action (PERMIT / ROUTE / FORWARD / DENY), latency
- **API-first** — connects to your existing tools, not the other way around

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5174` — runs in demo mode out of the box with a sample 6-node topology.

---

## Connecting to a Real Network

Click **⚡ CONNECT API** in the top right and choose your data source:

### SNMP / CDP / LLDP (Local Agent)
Discovers your real topology by walking SNMP and reading CDP/LLDP neighbors.

```bash
npx packet-follower-agent --seed 192.168.1.1 --community public
```

Then set the agent URL to `http://localhost:7474` in the connector panel.

### ThousandEyes
Enter your API key — pulls live topology and path data from the ThousandEyes v7 API.

### Generic REST API
Works with any API that exposes `/topology` and `/trace` endpoints. Subclass `GenericAdapter` in `src/api/adapters/generic.js` to map your vendor's schema.

---

## API Adapter Structure

```
src/api/
├── index.js              # Unified API entry point
└── adapters/
    ├── generic.js        # Base class — extend for any REST API
    ├── snmp.js           # SNMP / CDP / LLDP via local agent
    └── thousandeyes.js   # ThousandEyes v7
```

Adding a new integration: extend `GenericAdapter`, override `getTopology()` and `trace()`, register it in `src/api/index.js`.

---

## Tech Stack

- **React + Three.js** (via React Three Fiber) — 3D rendering
- **GSAP** — packet orb and camera animations
- **Zustand** — state management
- **Vite** — dev server and build

---

## Roadmap

- [ ] Local SNMP agent (`packet-follower-agent`)
- [ ] NetFlow / sFlow ingestion for real traffic replay
- [ ] Multi-packet god view with live flow streams
- [ ] Electron desktop app (for direct local network access)
- [ ] Cisco, Juniper, Palo Alto adapter presets
- [ ] Export trace reports (PDF / JSON)

---

Built by Inner Circle Group LLC
