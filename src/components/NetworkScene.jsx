import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { NetworkNode } from './NetworkNode.jsx'
import { NetworkLink } from './NetworkLink.jsx'
import { PacketOrb } from './PacketOrb.jsx'
import { FollowCamera } from './FollowCamera.jsx'
import { useStore } from '../store/index.js'

function Scene({ topology }) {
  const { trace, traceStep, tracing, mode, advanceStep } = useStore()

  const visitedIds = new Set(
    (trace?.hops || []).slice(0, traceStep + 1).map(h => h.nodeId)
  )
  const activeId = trace?.hops?.[traceStep]?.nodeId

  const activeLinks = new Set()
  if (trace && traceStep >= 1) {
    for (let i = 1; i <= traceStep; i++) {
      const from = trace.hops[i - 1].nodeId
      const to = trace.hops[i].nodeId
      activeLinks.add(`${from}-${to}`)
      activeLinks.add(`${to}-${from}`)
    }
  }

  const nodeMap = Object.fromEntries((topology?.nodes || []).map(n => [n.id, n]))

  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#e8f0ff" />
      <directionalLight position={[-5, -4, -3]} intensity={0.2} color="#334466" />

      {(topology?.links || []).map(link => {
        const src = nodeMap[link.source]
        const tgt = nodeMap[link.target]
        if (!src || !tgt) return null
        const isActive = activeLinks.has(`${link.source}-${link.target}`)
        return <NetworkLink key={link.id} source={src} target={tgt} isActive={isActive} link={link} />
      })}

      {(topology?.nodes || []).map(node => (
        <NetworkNode
          key={node.id}
          node={node}
          isActive={node.id === activeId}
          isVisited={visitedIds.has(node.id)}
        />
      ))}

      <PacketOrb topology={topology} onHopComplete={advanceStep} />
      <FollowCamera topology={topology} />

      <OrbitControls
        enabled={mode === 'god' || !tracing}
        enablePan={true} enableZoom={true} enableRotate={true}
        minDistance={4} maxDistance={30}
        makeDefault
      />
    </>
  )
}

export function NetworkScene({ topology }) {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, top: 52, background: '#0d1117' }}
      camera={{ position: [0, 4, 14], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
    >
      <Scene topology={topology} />
    </Canvas>
  )
}
