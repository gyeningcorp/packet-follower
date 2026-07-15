import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store/index.js'
import gsap from 'gsap'

const ACTION_COLORS = {
  ORIGIN:  '#388bfd',
  FORWARD: '#39c5cf',
  ROUTE:   '#d29922',
  PERMIT:  '#3fb950',
  DENY:    '#f85149',
  DELIVER: '#a371f7',
}

export function PacketOrb({ topology, onHopComplete }) {
  const orbRef = useRef()
  const lightRef = useRef()
  const prevStep = useRef(-1)
  const { trace, traceStep, tracing } = useStore()

  const currentHop = trace?.hops?.[traceStep]
  const currentNode = topology?.nodes?.find(n => n.id === currentHop?.nodeId)

  useFrame((state) => {
    // Detect step change and animate orb to new position
    if (prevStep.current !== traceStep && currentNode) {
      prevStep.current = traceStep

      const target = currentNode.position
      const color = ACTION_COLORS[currentHop?.action] || '#388bfd'
      const isReview = !tracing && trace

      gsap.killTweensOf(orbRef.current?.position)
      if (orbRef.current) {
        gsap.to(orbRef.current.position, {
          x: target[0], y: target[1], z: target[2],
          duration: isReview ? 0.3 : 0.7,
          ease: 'power2.inOut',
          onComplete: () => {
            if (tracing) setTimeout(() => onHopComplete?.(), 800)
          }
        })
        if (orbRef.current.material) {
          orbRef.current.material.emissive.set(color)
        }
      }
    }

    // Subtle breathing pulse
    if (orbRef.current) {
      const active = tracing || (trace && traceStep >= 0)
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.015
      const base = active ? 0.14 : 0
      orbRef.current.scale.setScalar(base + pulse)

      if (lightRef.current) {
        lightRef.current.intensity = active
          ? 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
          : 0
      }
    }
  })

  const startPos = topology?.nodes?.[0]?.position || [0, 0, 0]

  return (
    <group>
      <mesh ref={orbRef} position={startPos}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#388bfd"
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <pointLight ref={lightRef} color="#388bfd" intensity={0} distance={2.5} decay={2} />
    </group>
  )
}
