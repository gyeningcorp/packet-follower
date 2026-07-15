import { GenericAdapter } from './adapters/generic.js'
import { SNMPAdapter } from './adapters/snmp.js'
import { ThousandEyesAdapter } from './adapters/thousandeyes.js'
import { mockTopology, mockTraceResult } from '../data/mockTopology.js'

export const ADAPTERS = {
  mock:         'Mock (Demo)',
  snmp:         'SNMP / CDP / LLDP (Local Agent)',
  generic:      'Generic REST API',
  thousandeyes: 'ThousandEyes',
}

let _adapter = null
let _config = null

export function getAdapterConfig() {
  return _config
}

export function connectAPI(type, config = {}) {
  _config = { type, ...config }
  switch (type) {
    case 'snmp':         _adapter = new SNMPAdapter(config);         break
    case 'thousandeyes': _adapter = new ThousandEyesAdapter(config); break
    case 'generic':      _adapter = new GenericAdapter(config);      break
    default:             _adapter = null  // mock
  }
}

export async function fetchTopology() {
  if (!_adapter) return mockTopology
  return _adapter.getTopology()
}

export async function runTrace(src, dst, options = {}) {
  if (!_adapter) {
    // Simulate async delay for mock
    await new Promise(r => setTimeout(r, 600))
    return mockTraceResult
  }
  return _adapter.trace(src, dst, options)
}
