import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

const NODE_COLORS = {
  endpoint: '#00aaff',
  switch:   '#00cc88',
  router:   '#ff9900',
  firewall: '#ff4444',
}

const NODE_SHAPES = {
  endpoint: 'sphere',
  switch:   'box',
  router:   'octahedron',
  firewall: 'box',
}

export function NetworkNode({ node, isActive, isVisited }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const color = NODE_COLORS[node.type] || '#ffffff'

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (isActive) {
      meshRef.current.rotation.y += delta * 2
    }
    const targetScale = isActive ? 1.6 : hovered ? 1.2 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
  })

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {node.type === 'router' ? (
          <octahedronGeometry args={[0.4]} />
        ) : node.type === 'switch' || node.type === 'firewall' ? (
          <boxGeometry args={[0.6, 0.35, 0.6]} />
        ) : (
          <sphereGeometry args={[0.35, 32, 32]} />
        )}
        <meshStandardMaterial
          color={isVisited ? color : '#334'}
          emissive={color}
          emissiveIntensity={isActive ? 1.2 : isVisited ? 0.4 : 0.05}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Glow ring for active node */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.04, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.75, 0]}
          fontSize={0.22}
          color={isVisited || isActive ? '#e0f0ff' : '#556'}
          anchorX="center"
          anchorY="bottom"
        >
          {node.label}
        </Text>
        <Text
          position={[0, 0.48, 0]}
          fontSize={0.15}
          color={isVisited || isActive ? '#88aacc' : '#445'}
          anchorX="center"
          anchorY="bottom"
        >
          {node.ip}
        </Text>
      </Billboard>
    </group>
  )
}
