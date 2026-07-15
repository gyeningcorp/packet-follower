import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store/index.js'
import * as THREE from 'three'
import gsap from 'gsap'

const ACTION_COLORS = {
  ORIGIN:  '#00aaff',
  FORWARD: '#00ffcc',
  ROUTE:   '#ff9900',
  PERMIT:  '#00ff88',
  DENY:    '#ff2244',
  DELIVER: '#ffdd00',
}

export function PacketOrb({ topology, onHopComplete }) {
  const orbRef = useRef()
  const lightRef = useRef()
  const { trace, traceStep, tracing, mode } = useStore()

  const currentHop = trace?.hops?.[traceStep]
  const currentNode = topology?.nodes?.find(n => n.id === currentHop?.nodeId)

  // Animate orb to current hop's node position
  useEffect(() => {
    if (!orbRef.current || !currentNode || !tracing) return

    const target = currentNode.position
    const color = ACTION_COLORS[currentHop?.action] || '#00aaff'

    gsap.to(orbRef.current.position, {
      x: target[0], y: target[1], z: target[2],
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        setTimeout(() => onHopComplete?.(), 900)
      }
    })

    if (orbRef.current.material) {
      gsap.to(orbRef.current.material, {
        emissiveIntensity: 2.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      })
      orbRef.current.material.emissive.set(color)
    }
  }, [traceStep, currentNode])

  useFrame((state, delta) => {
    if (!orbRef.current) return
    orbRef.current.rotation.y += delta * 3
    orbRef.current.rotation.x += delta * 1.5
    // Pulse
    const pulse = Math.sin(state.clock.elapsedTime * 6) * 0.06
    const base = tracing ? 0.22 : 0
    orbRef.current.scale.setScalar(base + pulse)

    if (lightRef.current) {
      lightRef.current.intensity = tracing ? 1.5 + Math.sin(state.clock.elapsedTime * 8) * 0.5 : 0
    }
  })

  const startPos = topology?.nodes?.[0]?.position || [0, 0, 0]

  return (
    <group>
      <mesh ref={orbRef} position={startPos}>
        <icosahedronGeometry args={[0.22, 2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00aaff"
          emissiveIntensity={1.8}
          roughness={0}
          metalness={1}
          wireframe={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#00ccff"
        intensity={0}
        distance={3}
        decay={2}
      />
    </group>
  )
}
