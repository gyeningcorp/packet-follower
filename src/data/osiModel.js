export const OSI_LAYERS = [
  {
    num: 7, name: 'APPLICATION', shortName: 'APP', color: '#ff6655',
    issues: [
      { id: 'dns_fail',    label: 'DNS resolution failed',    cmd: 'dig / nslookup' },
      { id: 'http_err',    label: 'HTTP 4xx / 5xx error',     cmd: 'curl -v / wget' },
      { id: 'svc_down',    label: 'Service unreachable',      cmd: 'telnet / nc' },
      { id: 'dhcp_ex',     label: 'DHCP pool exhausted',      cmd: 'show ip dhcp pool' },
    ]
  },
  {
    num: 6, name: 'PRESENTATION', shortName: 'PRES', color: '#ff9900',
    issues: [
      { id: 'tls_fail',    label: 'TLS handshake failed',     cmd: 'openssl s_client' },
      { id: 'cert_exp',    label: 'Certificate expired',      cmd: 'show ssl cert' },
      { id: 'cipher_mis',  label: 'Cipher suite mismatch',    cmd: 'ssl debug log' },
    ]
  },
  {
    num: 5, name: 'SESSION', shortName: 'SESS', color: '#ffdd00',
    issues: [
      { id: 'sess_full',   label: 'Session table exhausted',  cmd: 'show conn / show session' },
      { id: 'auth_to',     label: 'Auth / login timeout',     cmd: 'debug aaa' },
      { id: 'stale_conn',  label: 'Stale connection cleanup', cmd: 'clear conn' },
    ]
  },
  {
    num: 4, name: 'TRANSPORT', shortName: 'TRANS', color: '#00ff88',
    issues: [
      { id: 'port_blk',    label: 'Port blocked by policy',   cmd: 'show access-list' },
      { id: 'syn_to',      label: 'TCP SYN timeout',          cmd: 'show tcp brief' },
      { id: 'qos_drop',    label: 'QoS policy drop',          cmd: 'show policy-map int' },
      { id: 'udp_unr',     label: 'UDP unreachable (ICMP)',   cmd: 'ping / traceroute' },
    ]
  },
  {
    num: 3, name: 'NETWORK', shortName: 'NET', color: '#00aaff',
    issues: [
      { id: 'no_route',    label: 'No route to destination',  cmd: 'show ip route' },
      { id: 'acl_deny',    label: 'ACL / firewall deny',      cmd: 'show access-lists' },
      { id: 'ttl_exp',     label: 'TTL expired (loop?)',      cmd: 'traceroute / mtrace' },
      { id: 'nat_fail',    label: 'NAT translation failure',  cmd: 'show ip nat trans' },
    ]
  },
  {
    num: 2, name: 'DATA LINK', shortName: 'L2', color: '#8866ff',
    issues: [
      { id: 'stp_blk',     label: 'STP port blocking',        cmd: 'show spanning-tree' },
      { id: 'vlan_mis',    label: 'VLAN mismatch',            cmd: 'show int trunk' },
      { id: 'trunk_down',  label: 'Trunk / 802.1Q down',      cmd: 'show int trunk' },
      { id: 'duplex',      label: 'Duplex mismatch',          cmd: 'show int status' },
      { id: 'mac_flap',    label: 'MAC address flapping',     cmd: 'show mac address-table' },
    ]
  },
  {
    num: 1, name: 'PHYSICAL', shortName: 'PHY', color: '#667788',
    issues: [
      { id: 'no_carrier',  label: 'No carrier / link down',   cmd: 'show int / show cdp nei' },
      { id: 'bad_cable',   label: 'Bad cable or SFP',         cmd: 'show int transceiver' },
      { id: 'err_dis',     label: 'Interface err-disabled',   cmd: 'show int | inc err' },
      { id: 'power',       label: 'Power / PoE issue',        cmd: 'show power inline' },
    ]
  },
]

// Phase tags from hop stages → OSI layer number
export const PHASE_TO_LAYER = {
  // L7
  DNS: 7, APP: 7, HTTP: 7, DHCP: 7, HTTPS: 7, NOTE: 7,
  // L6
  TLS: 6, SSL: 6, ENCRYPT: 6, COMPRESS: 6,
  // L5
  SESSION: 5,
  // L4
  TCP: 4, UDP: 4, INSPECT: 4,
  // L3
  L3: 3, RIB: 3, CEF: 3, NAT: 3, TTL: 3, ACL: 3, ROUTE: 3,
  // L2
  ARP: 2, L2: 2, CAM: 2, VLAN: 2, TRUNK: 2, STP: 2, FWD: 2, MATCH: 2, MAC: 2,
  // L1
  RECV: 1, LINK: 1, POWER: 1, PHY: 1,
}

// Return Set of layer numbers active in these stages
export function getActiveLayers(stages = []) {
  const layers = new Set()
  stages.forEach(s => {
    const l = PHASE_TO_LAYER[s.phase]
    if (l) layers.add(l)
  })
  return layers
}

// Return Set of layer numbers visited across all hops up to traceStep
export function getAllVisitedLayers(hops = [], upToStep = 0) {
  const layers = new Set()
  hops.slice(0, upToStep + 1).forEach(h =>
    (h.stages || []).forEach(s => {
      const l = PHASE_TO_LAYER[s.phase]
      if (l) layers.add(l)
    })
  )
  return layers
}

// Detect which layer caused a DENY
export function detectIssueLayer(stages = []) {
  const phases = new Set(stages.map(s => s.phase))
  if ([...phases].some(p => ['POWER', 'LINK', 'PHY'].includes(p))) return 1
  if ([...phases].some(p => ['STP', 'VLAN', 'TRUNK', 'L2', 'CAM'].includes(p))) return 2
  if ([...phases].some(p => ['ACL', 'MATCH', 'RIB', 'NAT', 'TTL', 'L3'].includes(p))) return 3
  if ([...phases].some(p => ['TCP', 'UDP', 'INSPECT'].includes(p))) return 4
  if ([...phases].some(p => ['SESSION'].includes(p))) return 5
  if ([...phases].some(p => ['TLS', 'SSL', 'ENCRYPT'].includes(p))) return 6
  if ([...phases].some(p => ['DNS', 'APP'].includes(p))) return 7
  return 3
}

// Human-readable issue label for a DENY at a given layer
export const ISSUE_LABELS = {
  1: 'Layer 1 — Physical link problem',
  2: 'Layer 2 — STP / VLAN / trunk issue',
  3: 'Layer 3 — Routing / ACL block',
  4: 'Layer 4 — Port / transport block',
  5: 'Layer 5 — Session problem',
  6: 'Layer 6 — TLS / encryption failure',
  7: 'Layer 7 — Application error',
}
