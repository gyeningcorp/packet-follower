export const mockTopology = {
  nodes: [
    { id: 'pc-01',     label: 'PC-01',          ip: '10.0.0.10',   type: 'endpoint', position: [-8, 0, 0] },
    { id: 'sw-access', label: 'SW-ACCESS-01',   ip: '10.0.0.1',    type: 'switch',   position: [-5, 0, 0] },
    { id: 'sw-dist',   label: 'SW-DIST-01',     ip: '10.0.1.1',    type: 'switch',   position: [-2, 2, 0] },
    { id: 'fw-01',     label: 'FW-EDGE-01',     ip: '10.0.2.1',    type: 'firewall', position: [1, 2, 0]  },
    { id: 'rtr-core',  label: 'RTR-CORE-01',    ip: '10.0.3.1',    type: 'router',   position: [4, 0, 0]  },
    { id: 'srv-web',   label: 'SRV-WEB-01',     ip: '10.0.4.10',   type: 'endpoint', position: [7, 0, 0]  },
  ],
  links: [
    { id: 'l1', source: 'pc-01',     target: 'sw-access', bandwidth: '1G',  latency: 1  },
    { id: 'l2', source: 'sw-access', target: 'sw-dist',   bandwidth: '10G', latency: 2  },
    { id: 'l3', source: 'sw-dist',   target: 'fw-01',     bandwidth: '10G', latency: 1  },
    { id: 'l4', source: 'fw-01',     target: 'rtr-core',  bandwidth: '10G', latency: 3  },
    { id: 'l5', source: 'rtr-core',  target: 'srv-web',   bandwidth: '10G', latency: 1  },
  ]
}

export const mockTraceResult = {
  src: 'pc-01',
  dst: 'srv-web',
  protocol: 'TCP',
  dstPort: 443,
  hops: [
    { nodeId: 'pc-01',     action: 'ORIGIN',  detail: 'SRC 10.0.0.10:54321 → 10.0.4.10:443',  latencyMs: 0   },
    { nodeId: 'sw-access', action: 'FORWARD', detail: 'Out Gi0/1 → VLAN10, MAC learned',        latencyMs: 1   },
    { nodeId: 'sw-dist',   action: 'FORWARD', detail: 'Out Te0/1 → routed uplink, L3 handoff',  latencyMs: 3   },
    { nodeId: 'fw-01',     action: 'PERMIT',  detail: 'ACL INBOUND rule 42: PERMIT TCP any 443', latencyMs: 4  },
    { nodeId: 'rtr-core',  action: 'ROUTE',   detail: 'BGP next-hop 10.0.4.1, Out Gi0/0',       latencyMs: 7   },
    { nodeId: 'srv-web',   action: 'DELIVER', detail: 'SYN received, TCP handshake initiated',   latencyMs: 8   },
  ]
}
