import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MEDIUM_IDLE = {
  fiber:    { color: '#0088cc', opacity: 0.5 },
  copper:   { color: '#cc6622', opacity: 0.45 },
  wireless: { color: '#6644aa', opacity: 0.35 },
  unknown:  { color: '#1a3a5c', opacity: 0.4  },
}

const MEDIUM_ACTIVE = {
  fiber:    { color: '#00eeff', opacity: 1.0 },
  copper:   { color: '#ffaa44', opacity: 1.0 },
  wireless: { color: '#cc99ff', opacity: 1.0 },
  unknown:  { color: '#00ffcc', opacity: 1.0  },
}

export function NetworkLink({ source, target, isActive, link }) {
  const matRef = useRef()
  const medium = link?.medium || 'unknown'
  const idle = MEDIUM_IDLE[medium]
  const active = MEDIUM_ACTIVE[medium]

  const points = useMemo(() => [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position)
  ], [source, target])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    g.computeBoundingSphere()
    return g
  }, [points])

  // Pulse the active fiber line so it reads as "light traveling"
  useFrame((state) => {
    if (!matRef.current || !isActive) return
    if (medium === 'fiber') {
      matRef.current.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 10) * 0.3
    } else if (medium === 'wireless') {
      matRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 6) * 0.5
    }
  })

  const color = isActive ? active.color : idle.color
  const opacity = isActive ? active.opacity : idle.opacity

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={opacity}
      />
    </line>
  )
}
