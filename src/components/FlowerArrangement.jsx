import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Block({ position, size, color, rotation = [0, 0, 0] }) {
  const mesh = useRef()
  
  return (
    <mesh ref={mesh} position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

function Particle({ position, velocity, color, size, lifetime }) {
  const mesh = useRef()
  const startTime = useRef(Date.now())
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000
    if (elapsed > lifetime) return

    mesh.current.position.x += velocity[0]
    mesh.current.position.y += velocity[1]
    mesh.current.position.z += velocity[2]
    
    // Yerçekimi etkisi
    velocity[1] -= 0.01
    
    // Opaklık azaltma
    mesh.current.material.opacity = 1 - (elapsed / lifetime)
  })

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={color}
        transparent
        opacity={1}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  )
}

function ParticleSystem({ position, color, type }) {
  const particles = useRef([])
  
  useFrame(() => {
    if (Math.random() < 0.1) {
      const velocity = [
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.02,
        (Math.random() - 0.5) * 0.02
      ]
      
      particles.current.push({
        position: [...position],
        velocity,
        color,
        size: 0.05,
        lifetime: 2
      })
    }
    
    particles.current = particles.current.filter(p => {
      const elapsed = (Date.now() - p.startTime) / 1000
      return elapsed < p.lifetime
    })
  })

  return (
    <group>
      {particles.current.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </group>
  )
}

function Water({ position, size }) {
  const mesh = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    mesh.current.position.y = position[1] + Math.sin(time * 2) * 0.02
  })

  return (
    <mesh ref={mesh} position={position} rotation={[0, 0, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color="#4a90e2"
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  )
}

function Flower({ position, rotation, scale, color, type = 'rose' }) {
  const group = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    group.current.rotation.x = Math.sin(time * 0.2 + position[0]) * 0.1
    group.current.rotation.z = Math.cos(time * 0.3 + position[2]) * 0.1
    group.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.05
  })

  const blocks = []
  const blockSize = 0.2

  // Farklı çiçek türleri
  if (type === 'rose') {
    // Gül yapısı
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 0.4
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      blocks.push(
        <Block 
          key={`petal-${i}`}
          position={[x, 0.2, z]}
          size={[blockSize, blockSize, blockSize]}
          color={color}
          rotation={[0, angle, 0]}
        />
      )
    }
  } else if (type === 'daisy') {
    // Papatya yapısı
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const radius = 0.5
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      blocks.push(
        <Block 
          key={`petal-${i}`}
          position={[x, 0, z]}
          size={[blockSize * 1.5, blockSize * 0.5, blockSize]}
          color="#ffffff"
          rotation={[0, angle, 0]}
        />
      )
    }
  } else if (type === 'tulip') {
    // Lale yapısı
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      blocks.push(
        <Block 
          key={`petal-${i}`}
          position={[x, 0.3, z]}
          size={[blockSize, blockSize * 2, blockSize]}
          color={color}
          rotation={[Math.PI / 4, angle, 0]}
        />
      )
    }
  }

  // Çiçek merkezi
  blocks.push(
    <Block 
      key="center"
      position={[0, 0.2, 0]}
      size={[blockSize * 1.5, blockSize * 1.5, blockSize * 1.5]}
      color={type === 'daisy' ? "#ffff00" : "#ffff00"}
    />
  )

  // Gövde
  for (let i = 0; i < 4; i++) {
    blocks.push(
      <Block 
        key={`stem-${i}`}
        position={[0, -0.2 - (i * blockSize), 0]}
        size={[blockSize * 0.5, blockSize, blockSize * 0.5]}
        color="#228B22"
      />
    )
  }

  // Yapraklar
  blocks.push(
    <Block 
      key="leaf1"
      position={[0.3, -0.4, 0]}
      size={[blockSize * 2, blockSize * 0.5, blockSize]}
      color="#228B22"
      rotation={[0, Math.PI / 4, 0]}
    />
  )
  blocks.push(
    <Block 
      key="leaf2"
      position={[-0.3, -0.6, 0]}
      size={[blockSize * 2, blockSize * 0.5, blockSize]}
      color="#228B22"
      rotation={[0, -Math.PI / 4, 0]}
    />
  )

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {blocks}
    </group>
  )
}

function Heart({ position, scale = [1, 1, 1], color = "#ff69b4" }) {
  const group = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    group.current.rotation.y = Math.sin(time * 0.2) * 0.1
    group.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1
  })

  const blocks = []
  const blockSize = 0.2

  // Kalp şekli için bloklar
  const heartShape = [
    // Sol üst
    { pos: [-1, 1, 0], size: [1, 1, 1] },
    { pos: [-2, 0, 0], size: [1, 1, 1] },
    { pos: [-1, -1, 0], size: [1, 1, 1] },
    // Sağ üst
    { pos: [1, 1, 0], size: [1, 1, 1] },
    { pos: [2, 0, 0], size: [1, 1, 1] },
    { pos: [1, -1, 0], size: [1, 1, 1] },
    // Alt
    { pos: [0, -2, 0], size: [1, 1, 1] },
    { pos: [-1, -3, 0], size: [1, 1, 1] },
    { pos: [1, -3, 0], size: [1, 1, 1] },
  ]

  heartShape.forEach((block, index) => {
    blocks.push(
      <Block 
        key={`heart-${index}`}
        position={[
          block.pos[0] * blockSize,
          block.pos[1] * blockSize,
          block.pos[2] * blockSize
        ]}
        size={[
          block.size[0] * blockSize,
          block.size[1] * blockSize,
          block.size[2] * blockSize
        ]}
        color={color}
      />
    )
  })

  return (
    <group ref={group} position={position} scale={scale}>
      {blocks}
    </group>
  )
}

function FlowerArrangement() {
  const group = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    group.current.rotation.y = Math.sin(time * 0.1) * 0.1
  })

  // Minecraft flower colors
  const flowerColors = [
    "#ff69b4", // Pink
    "#ff1493", // Deep Pink
    "#ff0000", // Red
    "#ff4500", // Orange Red
    "#ffa500", // Orange
    "#ffff00", // Yellow
    "#00ff00", // Lime
    "#32cd32", // Green
    "#00ffff", // Cyan
    "#1e90ff", // Blue
    "#8a2be2", // Purple
    "#ff00ff", // Magenta
    "#ffffff", // White
    "#ffd700", // Gold
    "#daa520", // Golden Rod
  ]

  const flowers = []
  const numFlowers = 25
  const baseRadius = 0.5
  const heightRange = 2.5

  // Çiçek türleri
  const flowerTypes = ['rose', 'daisy', 'tulip']

  // Vazo içinde doğal buket düzeni
  for (let i = 0; i < numFlowers; i++) {
    const t = i / numFlowers
    const angle = t * Math.PI * 4
    const radius = baseRadius * (0.2 + t * 0.8)
    const height = t * heightRange

    const randomOffset = 0.15
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * randomOffset
    const z = Math.sin(angle) * radius + (Math.random() - 0.5) * randomOffset
    const y = height + (Math.random() - 0.5) * randomOffset

    const scale = 0.4 + Math.random() * 0.2
    const rotation = [
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * Math.PI * 1.5,
      (Math.random() - 0.5) * 0.4
    ]
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)]
    const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)]

    flowers.push({
      position: [x, y - 1.8, z],
      rotation: rotation,
      scale: [scale, scale, scale],
      color: color,
      type: type
    })
  }

  // Create a decorative vase
  const vaseBlocks = []
  const vaseSize = 0.3
  const vaseHeight = 5
  const vaseRadius = 2.5

  // Vazo desen renkleri
  const vaseColors = {
    main: "#4a4a4a",
    pattern: "#5a5a5a",
    highlight: "#6a6a6a",
    base: "#3a3a3a"
  }

  // Vazo gövdesi ve desenler
  for (let y = 0; y < vaseHeight; y++) {
    const radius = vaseRadius - (y * 0.4)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const x = Math.cos(angle) * radius * vaseSize
      const z = Math.sin(angle) * radius * vaseSize
      
      let color = vaseColors.main
      if (i % 3 === 0) color = vaseColors.pattern
      if (y % 2 === 0 && i % 4 === 0) color = vaseColors.highlight

      vaseBlocks.push(
        <Block 
          key={`vase-${y}-${i}`}
          position={[x, -2 - (y * vaseSize), z]}
          size={[vaseSize, vaseSize, vaseSize]}
          color={color}
        />
      )
    }
  }

  // Vazo tabanı
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (Math.sqrt(x*x + z*z) <= 2.5) {
        vaseBlocks.push(
          <Block 
            key={`vase-base-${x}-${z}`}
            position={[x * vaseSize, -2 - (vaseHeight * vaseSize), z * vaseSize]}
            size={[vaseSize, vaseSize, vaseSize]}
            color={vaseColors.base}
          />
        )
      }
    }
  }

  // Su efekti
  const waterBlocks = []
  const waterLevel = -2.5
  const waterRadius = 2.2

  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (Math.sqrt(x*x + z*z) <= waterRadius) {
        waterBlocks.push(
          <Water 
            key={`water-${x}-${z}`}
            position={[x * vaseSize, waterLevel, z * vaseSize]}
            size={[vaseSize, vaseSize * 0.5, vaseSize]}
          />
        )
      }
    }
  }

  // Kalpler için pozisyonlar
  const hearts = []
  const numHearts = 8
  const heartRadius = 4
  const heartHeight = 3

  for (let i = 0; i < numHearts; i++) {
    const angle = (i / numHearts) * Math.PI * 2
    const x = Math.cos(angle) * heartRadius
    const z = Math.sin(angle) * heartRadius
    const y = Math.sin(angle * 2) * heartHeight

    const scale = 0.3 + Math.random() * 0.2
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)]

    hearts.push({
      position: [x, y, z],
      scale: [scale, scale, scale],
      color: color
    })
  }

  return (
    <group ref={group}>
      {flowers.map((props, index) => (
        <Flower key={index} {...props} />
      ))}
      {vaseBlocks}
      {waterBlocks}
      <ParticleSystem position={[0, waterLevel, 0]} color="#4a90e2" type="water" />
      {flowers.map((flower, index) => (
        <ParticleSystem 
          key={`particles-${index}`}
          position={flower.position}
          color={flower.color}
          type="flower"
        />
      ))}
      {hearts.map((props, index) => (
        <Heart key={`heart-${index}`} {...props} />
      ))}
    </group>
  )
}

export default FlowerArrangement 