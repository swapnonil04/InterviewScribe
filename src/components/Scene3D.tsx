import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingGeometry = ({ position, geometry }: { position: [number, number, number], geometry: 'sphere' | 'box' | 'torus' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Background objects should move continuously
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {geometry === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
      {geometry === 'box' && <boxGeometry args={[0.5, 0.5, 0.5]} />}
      {geometry === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
      <meshStandardMaterial
        color={geometry === 'sphere' ? '#ff00ff' : geometry === 'box' ? '#00ffff' : '#ff00ff'}
        emissive={geometry === 'sphere' ? '#ff00ff' : geometry === 'box' ? '#00ffff' : '#ff00ff'}
        emissiveIntensity={0.1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

const SimpleGrid = () => {
  const gridRef = useRef<THREE.Group>(null);
  
  // Keep grid moving
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 1.5) % 10 - 5;
    }
  });

  return (
    <group ref={gridRef}>
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial 
          color="#001122" 
          transparent 
          opacity={0.2} 
          wireframe 
        />
      </mesh>
    </group>
  );
};

const Scene3D = () => {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} color="#ff00ff" intensity={0.8} />
        <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={0.8} />
        
        {/* Static floating geometries */}
        <FloatingGeometry position={[-3, 2, 0]} geometry="sphere" />
        <FloatingGeometry position={[3, -1, 2]} geometry="box" />
        <FloatingGeometry position={[0, 3, -2]} geometry="torus" />
        <FloatingGeometry position={[-4, -2, 1]} geometry="sphere" />
        <FloatingGeometry position={[4, 1, -1]} geometry="torus" />
        
        {/* Static grid */}
        <SimpleGrid />
      </Canvas>
    </div>
  );
};

export default Scene3D;