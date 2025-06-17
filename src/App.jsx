import React, { Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Stars,
  Grid
} from '@react-three/drei'
import FlowerArrangement from './components/FlowerArrangement'
import './App.css'

function Scene() {
  const { camera } = useThree()
  const controlsRef = useRef()

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.5}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />
      
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.6} />
      
      {/* Main directional light simulating sun */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Grid for Minecraft style */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={3.3}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Environment lighting */}
      <Environment 
        preset="sunset" 
        background={false}
        blur={0.8}
      />
      
      <FlowerArrangement />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="overlay">
        <h1>Minecraft Çiçek Aranjmanı</h1>
        <p>Sevgilinize özel bu dijital çiçekleri sunun</p>
        <p className="instructions">Fare ile sürükleyerek çiçekleri döndürebilirsiniz</p>
      </div>
    </div>
  )
}

export default App 