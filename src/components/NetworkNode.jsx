import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, Billboard } from '@react-three/drei'
import { DEVICE_COLORS, getDeviceIcon } from './DeviceIcon.jsx'
import * as THREE from 'three'

export function NetworkNode({ node, isActive, isVisited }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const color = DEVICE_COLORS[node.type] || '#667788'

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (isActive) groupRef.current.rotation.y += delta * 0.8
    else groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1)
  })

  const iconSvg = getDeviceIcon(node.type, color)
  const scale = isActive ? 1.3 : hovered ? 1.1 : 1

  return (
    <group ref={groupRef} position={node.position}>
      {/* Glow plane behind icon */}
      {(isActive || isVisited) && (
        <mesh>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial color={color} transparent opacity={isActive ? 0.18 : 0.06} />
        </mesh>
      )}

      {/* Device icon */}
      <Html center distanceFactor={10} zIndexRange={[0, 10]}>
        <div
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          style={{
            width: 52, height: 52,
            transform: `scale(${scale})`,
            transition: 'transform 0.15s ease',
            filter: isActive
              ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})`
              : isVisited
              ? `drop-shadow(0 0 4px ${color}88)`
              : 'drop-shadow(0 0 2px #00224488)',
            opacity: isVisited || isActive ? 1 : 0.45,
            cursor: 'pointer',
          }}
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      </Html>

      {/* Pulsing ring on active node */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.03, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}

      {/* Labels */}
      <Billboard follow>
        <Text
          position={[0, 0.85, 0]}
          fontSize={0.2}
          color={isVisited || isActive ? '#e0f0ff' : '#3a5070'}
          anchorX="center" anchorY="bottom"
          outlineWidth={0.02} outlineColor="#000"
        >
          {node.label}
        </Text>
        <Text
          position={[0, 0.62, 0]}
          fontSize={0.14}
          color={isVisited || isActive ? '#667a8a' : '#223344'}
          anchorX="center" anchorY="bottom"
        >
          {node.vendor ? `${node.vendor} · ` : ''}{node.ip}
        </Text>
        {node.mac && (
          <Text
            position={[0, 0.44, 0]}
            fontSize={0.11}
            color="#2a3f55"
            anchorX="center" anchorY="bottom"
          >
            {node.mac.toUpperCase()}
          </Text>
        )}
      </Billboard>
    </group>
  )
}
