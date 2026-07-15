import { useRef } from 'react'
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

  // Animate orb to current hop's node — fires on live trace AND review stepping
  useRef(() => {}) // keep ref stable
  const prevStep = useRef(-1)

  useFrame(() => {
    // Drive animation via traceStep changes detected in frame loop
    if (prevStep.current === traceStep) return
    prevStep.current = traceStep

    if (!orbRef.current || !currentNode) return

    const target = currentNode.position
    const color = ACTION_COLORS[currentHop?.action] || '#00aaff'
    const isReview = !tracing && trace

    gsap.killTweensOf(orbRef.current.position)
    gsap.to(orbRef.current.position, {
      x: target[0], y: target[1], z: target[2],
      duration: isReview ? 0.35 : 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        // Only auto-advance during the live first pass
        if (tracing) setTimeout(() => onHopComplete?.(), 900)
      }
    })

    if (orbRef.current.material) {
      gsap.killTweensOf(orbRef.current.material)
      gsap.to(orbRef.current.material, {
        emissiveIntensity: 2.5, duration: 0.2, yoyo: true, repeat: 1
      })
      orbRef.current.material.emissive.set(color)
    }
  })

  useFrame((state, delta) => {
    if (!orbRef.current) return
    const active = tracing || (trace && traceStep >= 0)
    orbRef.current.rotation.y += delta * (tracing ? 3 : 1.5)
    orbRef.current.rotation.x += delta * (tracing ? 1.5 : 0.8)
    const pulse = Math.sin(state.clock.elapsedTime * (tracing ? 6 : 3)) * 0.06
    const base = active ? 0.22 : 0
    orbRef.current.scale.setScalar(base + pulse)

    if (lightRef.current) {
      lightRef.current.intensity = active ? 1.5 + Math.sin(state.clock.elapsedTime * 8) * 0.5 : 0
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
