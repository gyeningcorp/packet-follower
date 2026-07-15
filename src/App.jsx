import { useEffect } from 'react'
import { NetworkScene } from './components/NetworkScene.jsx'
import { Toolbar } from './components/Toolbar.jsx'
import { HopInfoCard } from './components/HopInfoCard.jsx'
import { APIConnectorPanel } from './components/APIConnectorPanel.jsx'
import { TopologyBuilder } from './components/TopologyBuilder.jsx'
import { useStore } from './store/index.js'
import { fetchTopology } from './api/index.js'

export default function App() {
  const { topology, setTopology, builderOpen, toggleBuilder } = useStore()

  useEffect(() => {
    fetchTopology().then(setTopology)
  }, [])

  return (
    <>
      <Toolbar onTopologyLoad={setTopology} />
      {topology && <NetworkScene topology={topology} />}
      <HopInfoCard topology={topology} />
      <APIConnectorPanel />
      <TopologyBuilder open={builderOpen} onClose={toggleBuilder} />
    </>
  )
}
