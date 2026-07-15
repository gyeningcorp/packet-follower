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
    { id: 'l1', source: 'pc-01',     target: 'sw-access', bandwidth: '1G',  latency: 1, medium: 'copper' },
    { id: 'l2', source: 'sw-access', target: 'sw-dist',   bandwidth: '10G', latency: 2, medium: 'fiber'  },
    { id: 'l3', source: 'sw-dist',   target: 'fw-01',     bandwidth: '10G', latency: 1, medium: 'fiber'  },
    { id: 'l4', source: 'fw-01',     target: 'rtr-core',  bandwidth: '10G', latency: 3, medium: 'fiber'  },
    { id: 'l5', source: 'rtr-core',  target: 'srv-web',   bandwidth: '10G', latency: 1, medium: 'copper' },
  ]
}

export const mockTraceResult = {
  src: 'pc-01',
  dst: 'srv-web',
  protocol: 'TCP',
  dstPort: 443,
  hops: [
    {
      nodeId: 'pc-01',
      action: 'ORIGIN',
      label: 'Packet Born',
      inMedium: null,
      latencyMs: 0,
      stages: [
        { phase: 'DNS',     detail: 'Resolved web.internal → 10.0.4.10 (cached, TTL 298s)' },
        { phase: 'ARP',     detail: 'Who has 10.0.0.1? → Gateway MAC aa:bb:cc:11:22:33 resolved' },
        { phase: 'L3',      detail: 'IP header: SRC 10.0.0.10  DST 10.0.4.10  TTL 64  PROTO TCP' },
        { phase: 'TCP',     detail: 'SYN flag set  SEQ=1842930  SRC port 54321 → DST 443' },
        { phase: 'L2',      detail: 'Ethernet frame built, VLAN10 tag applied, enqueued on NIC' },
      ]
    },
    {
      nodeId: 'sw-access',
      action: 'FORWARD',
      label: 'Access Switch',
      inMedium: 'copper',
      latencyMs: 1,
      stages: [
        { phase: 'RECV',    detail: 'Frame in on Gi0/24 (PC-01 access port)' },
        { phase: 'CAM',     detail: 'MAC table hit: DST aa:bb:cc:11:22:33 → out Gi0/1 (uplink)' },
        { phase: 'VLAN',    detail: 'VLAN10 membership verified, 802.1Q tag preserved' },
        { phase: 'FWD',     detail: 'Frame forwarded out Gi0/1 → SW-DIST-01 uplink' },
      ]
    },
    {
      nodeId: 'sw-dist',
      action: 'FORWARD',
      label: 'Distribution Switch',
      inMedium: 'fiber',
      latencyMs: 3,
      stages: [
        { phase: 'RECV',    detail: 'Frame in on Te0/2 (access uplink)' },
        { phase: 'L3',      detail: 'SVI VLAN10: DST 10.0.4.10 not local subnet — routing up' },
        { phase: 'TTL',     detail: 'TTL 64 → 63 (decremented at L3 boundary)' },
        { phase: 'FWD',     detail: 'Next-hop 10.0.2.1 (FW-EDGE-01) out Te0/1' },
      ]
    },
    {
      nodeId: 'fw-01',
      action: 'PERMIT',
      label: 'Firewall',
      inMedium: 'fiber',
      latencyMs: 4,
      stages: [
        { phase: 'RECV',    detail: 'Packet in on E1/1 (inside interface, zone TRUST)' },
        { phase: 'ACL',     detail: 'Evaluating INBOUND policy — 147 rules checked' },
        { phase: 'MATCH',   detail: 'Rule 42 HIT: PERMIT TCP 10.0.0.0/8 any dst-port 443' },
        { phase: 'SESSION', detail: 'Stateful table: new session created, conn-id 0x4A2F' },
        { phase: 'NAT',     detail: 'NAT policy: no match — source IP 10.0.0.10 unchanged' },
        { phase: 'FWD',     detail: 'Exiting E1/2 (outside interface, zone UNTRUST) → RTR-CORE-01' },
      ]
    },
    {
      nodeId: 'rtr-core',
      action: 'ROUTE',
      label: 'Core Router',
      inMedium: 'fiber',
      latencyMs: 7,
      stages: [
        { phase: 'RECV',    detail: 'Packet in on Gi0/1' },
        { phase: 'TTL',     detail: 'TTL 63 → 62' },
        { phase: 'RIB',     detail: 'Longest match: 10.0.4.0/24 via BGP  AD 20  metric 0' },
        { phase: 'CEF',     detail: 'CEF adjacency rewrite: new DST MAC dd:ee:ff:44:55:66' },
        { phase: 'FWD',     detail: 'Exiting Gi0/0 → SRV-WEB-01 segment' },
      ]
    },
    {
      nodeId: 'srv-web',
      action: 'DELIVER',
      label: 'Destination Reached',
      inMedium: 'copper',
      latencyMs: 8,
      stages: [
        { phase: 'RECV',    detail: 'Frame in on eth0, VLAN tag stripped by NIC' },
        { phase: 'L3',      detail: 'IP DST 10.0.4.10 matches local interface — accepted by kernel' },
        { phase: 'TCP',     detail: 'SYN received → SYN-ACK sent  SEQ=9938271  ACK=1842931' },
        { phase: 'TLS',     detail: 'TLS 1.3 ClientHello expected — handshake queued on port 443' },
        { phase: 'APP',     detail: 'Socket passed to nginx worker (pid 1847) — connection live' },
      ]
    },
  ]
}
