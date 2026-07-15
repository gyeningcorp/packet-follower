import { useEffect } from 'react'
import { NetworkScene } from './components/NetworkScene.jsx'
import { Toolbar } from './components/Toolbar.jsx'
import { HopInfoCard } from './components/HopInfoCard.jsx'
import { APIConnectorPanel } from './components/APIConnectorPanel.jsx'
import { TopologyBuilder } from './components/TopologyBuilder.jsx'
import { OSIPanel } from './components/OSIPanel.jsx'
import { useStore } from './store/index.js'
import { fetchTopology } from './api/index.js'

export default function App() {
  const { topology, setTopology, builderOpen, toggleBuilder, replaying, tracing, stepForward } = useStore()

  useEffect(() => {
    fetchTopology().then(setTopology)
  }, [])

  // Auto-replay: advance one hop at a time when replaying is active
  useEffect(() => {
    if (!replaying || tracing) return
    const interval = setInterval(() => {
      const { trace, traceStep } = useStore.getState()
      if (!trace || traceStep >= trace.hops.length - 1) {
        useStore.setState({ replaying: false })
      } else {
        useStore.getState().stepForward()
      }
    }, 1400)
    return () => clearInterval(interval)
  }, [replaying, tracing])

  return (
    <>
      <Toolbar onTopologyLoad={setTopology} />
      {topology && <NetworkScene topology={topology} />}
      <OSIPanel />
      <HopInfoCard topology={topology} />
      <APIConnectorPanel />
      <TopologyBuilder open={builderOpen} onClose={toggleBuilder} />
    </>
  )
}
