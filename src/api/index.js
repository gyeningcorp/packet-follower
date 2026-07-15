import { GenericAdapter } from './adapters/generic.js'
import { SNMPAdapter } from './adapters/snmp.js'
import { ThousandEyesAdapter } from './adapters/thousandeyes.js'
import { CatalystCenterAdapter } from './adapters/catalyst-center.js'
import { FortinetAdapter } from './adapters/fortinet.js'
import { ExtremeAdapter } from './adapters/extreme.js'
import { MerakiAdapter } from './adapters/meraki.js'
import { mockTopology, mockTraceResult } from '../data/mockTopology.js'

export const ADAPTERS = {
  mock:            'Mock (Demo)',
  snmp:            'SNMP / CDP / LLDP (Local Agent)',
  catalyst_center: 'Cisco Catalyst Center (DNA Center)',
  meraki:          'Cisco Meraki Dashboard',
  fortinet:        'Fortinet FortiManager',
  extreme:         'Extreme Networks ExtremeCloud IQ',
  thousandeyes:    'ThousandEyes',
  generic:         'Generic REST API',
}

let _adapter = null
let _config = null

export function getAdapterConfig() { return _config }

export function connectAPI(type, config = {}) {
  _config = { type, ...config }
  switch (type) {
    case 'snmp':            _adapter = new SNMPAdapter(config);           break
    case 'catalyst_center': _adapter = new CatalystCenterAdapter(config); break
    case 'fortinet':        _adapter = new FortinetAdapter(config);       break
    case 'extreme':         _adapter = new ExtremeAdapter(config);        break
    case 'meraki':          _adapter = new MerakiAdapter(config);         break
    case 'thousandeyes':    _adapter = new ThousandEyesAdapter(config);   break
    case 'generic':         _adapter = new GenericAdapter(config);        break
    default:                _adapter = null
  }
}

export async function fetchTopology() {
  if (!_adapter) return mockTopology
  return _adapter.getTopology()
}

export async function runTrace(src, dst, options = {}) {
  if (!_adapter) {
    await new Promise(r => setTimeout(r, 600))
    return mockTraceResult
  }
  return _adapter.trace(src, dst, options)
}
