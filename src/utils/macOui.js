// MAC OUI → vendor/device-type detection
// OUI = first 3 bytes of MAC address (XX:XX:XX)

const OUI_MAP = {
  // Cisco
  '00:00:0C': { vendor: 'Cisco',    type: 'router'   },
  '00:1A:A1': { vendor: 'Cisco',    type: 'switch'   },
  '00:1B:54': { vendor: 'Cisco',    type: 'switch'   },
  '00:1C:57': { vendor: 'Cisco',    type: 'router'   },
  '00:21:A0': { vendor: 'Cisco',    type: 'switch'   },
  '00:22:BD': { vendor: 'Cisco',    type: 'router'   },
  '00:26:CB': { vendor: 'Cisco',    type: 'switch'   },
  'F8:72:EA': { vendor: 'Cisco',    type: 'switch'   },
  'E4:AA:5D': { vendor: 'Cisco',    type: 'router'   },
  // Fortinet
  '00:09:0F': { vendor: 'Fortinet', type: 'firewall' },
  '00:1B:FC': { vendor: 'Fortinet', type: 'firewall' },
  '08:5B:0E': { vendor: 'Fortinet', type: 'firewall' },
  '70:4C:A5': { vendor: 'Fortinet', type: 'firewall' },
  'A4:8C:DB': { vendor: 'Fortinet', type: 'firewall' },
  // Palo Alto
  '00:1B:17': { vendor: 'Palo Alto', type: 'firewall' },
  'B4:0C:25': { vendor: 'Palo Alto', type: 'firewall' },
  // Juniper
  '00:12:1E': { vendor: 'Juniper',  type: 'router'   },
  '00:1F:12': { vendor: 'Juniper',  type: 'router'   },
  '2C:21:72': { vendor: 'Juniper',  type: 'router'   },
  // Extreme Networks
  '00:01:30': { vendor: 'Extreme',  type: 'switch'   },
  '00:04:96': { vendor: 'Extreme',  type: 'switch'   },
  '00:E0:2B': { vendor: 'Extreme',  type: 'switch'   },
  // Aruba / HPE
  '00:1A:1E': { vendor: 'Aruba',    type: 'wireless' },
  '24:DE:C6': { vendor: 'Aruba',    type: 'wireless' },
  '94:B4:0F': { vendor: 'Aruba',    type: 'wireless' },
  // Ubiquiti
  '00:27:22': { vendor: 'Ubiquiti', type: 'wireless' },
  '04:18:D6': { vendor: 'Ubiquiti', type: 'wireless' },
  '24:A4:3C': { vendor: 'Ubiquiti', type: 'wireless' },
  'DC:9F:DB': { vendor: 'Ubiquiti', type: 'wireless' },
  // Dell / EMC
  '00:14:22': { vendor: 'Dell',     type: 'server'   },
  '18:03:73': { vendor: 'Dell',     type: 'server'   },
  'F8:DB:88': { vendor: 'Dell',     type: 'server'   },
  // HP / ProCurve
  '00:17:A4': { vendor: 'HP',       type: 'switch'   },
  '00:1C:C4': { vendor: 'HP',       type: 'switch'   },
  // Apple
  'AC:BC:32': { vendor: 'Apple',    type: 'endpoint' },
  'F0:18:98': { vendor: 'Apple',    type: 'endpoint' },
  // VMware
  '00:0C:29': { vendor: 'VMware',   type: 'server'   },
  '00:50:56': { vendor: 'VMware',   type: 'server'   },
}

export function lookupOUI(mac) {
  if (!mac) return null
  // Normalize: XX:XX:XX or XX-XX-XX → upper, first 3 octets
  const normalized = mac.toUpperCase().replace(/-/g, ':')
  const oui = normalized.slice(0, 8)  // "AA:BB:CC"
  return OUI_MAP[oui] || null
}

export function inferDeviceType(mac, sysDescr = '') {
  const oui = lookupOUI(mac)
  if (oui) return oui

  // Fall back to sysDescr string matching (from SNMP)
  const desc = sysDescr.toLowerCase()
  if (desc.includes('fortigate') || desc.includes('fortios'))   return { vendor: 'Fortinet', type: 'firewall' }
  if (desc.includes('cisco ios') || desc.includes('catalyst'))  return { vendor: 'Cisco',    type: 'switch'   }
  if (desc.includes('cisco ios xe'))                            return { vendor: 'Cisco',    type: 'router'   }
  if (desc.includes('junos'))                                    return { vendor: 'Juniper',  type: 'router'   }
  if (desc.includes('extremexos'))                               return { vendor: 'Extreme',  type: 'switch'   }
  if (desc.includes('arubaos'))                                  return { vendor: 'Aruba',    type: 'wireless' }
  if (desc.includes('linux') || desc.includes('ubuntu'))        return { vendor: 'Linux',    type: 'server'   }
  if (desc.includes('windows server'))                          return { vendor: 'Microsoft', type: 'server'  }

  return { vendor: 'Unknown', type: 'unknown' }
}
