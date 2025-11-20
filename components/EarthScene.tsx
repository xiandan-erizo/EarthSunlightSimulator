import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, DoubleSide, BackSide } from 'three';
import { Stars, OrbitControls } from '@react-three/drei';

interface EarthSceneProps {
  hour: number;       // 0-24
  dayOfYear: number;  // 0-364
}

// Reliable Texture URLs via jsdelivr (proxied from three.js repo)
const EARTH_DAY_MAP = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_CLOUDS_MAP = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png";

export const EarthScene: React.FC<EarthSceneProps> = ({ hour, dayOfYear }) => {
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);

  // Load textures
  const [dayMap, cloudsMap] = useLoader(TextureLoader, [
    EARTH_DAY_MAP,
    EARTH_CLOUDS_MAP
  ]);

  // === Astronomical Calculations ===
  
  // 1. Earth Rotation (Time of Day)
  // UTC 12:00 means the Sun is roughly over the Prime Meridian (0 longitude).
  // We keep the Earth fixed in the scene (Prime Meridian at Z or X aligned) and rotate the Sun.
  
  // Sun Longitude relative to Earth:
  // Earth rotates 15 degrees per hour.
  // Angle = (Hour - 12) * 15 degrees (in radians).
  // Since we keep Earth static (mesh rotation 0), we move the light.
  // Sun moves East to West -> Negative angle.
  const sunLongitude = -((hour - 12) / 24) * Math.PI * 2;

  // 2. Sun Declination (Season)
  // Determines how high/low the sun is relative to the equator.
  // Max tilt approx 23.44 degrees.
  const maxDeclination = 23.44 * (Math.PI / 180);
  const declination = -maxDeclination * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);

  // 3. Calculate Cartesian Coordinates for the Light
  const sunDistance = 25;
  const sunX = sunDistance * Math.cos(declination) * Math.sin(sunLongitude);
  const sunY = sunDistance * Math.sin(declination);
  const sunZ = sunDistance * Math.cos(declination) * Math.cos(sunLongitude);

  useFrame(() => {
    if (cloudsRef.current) {
      // Rotate clouds slightly faster/independent of earth for effect
      cloudsRef.current.rotation.y += 0.0002; 
    }
  });

  return (
    <>
      {/* Deep Space Ambient - very low to ensure dark side is actually dark */}
      <ambientLight intensity={0.02} color="#ffffff" />
      
      {/* The Sun */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Sun Marker (Visual only, far away) */}
      <mesh position={[sunX * 2, sunY * 2, sunZ * 2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffdd00" />
      </mesh>

      <group rotation={[0, 0, 0]}>
        {/* Main Earth Sphere */}
        <mesh ref={earthRef} castShadow receiveShadow rotation={[0, -Math.PI / 2, 0]}> 
          {/* Rotate -PI/2 to align Prime Meridian roughly with Z axis for correct time mapping */}
          <sphereGeometry args={[5, 64, 64]} />
          <meshStandardMaterial
            map={dayMap}
            roughness={0.6}
            metalness={0.1}
            // Removed emissiveMap (Night Lights) to ensure the "Dark Side" is clearly black
          />
        </mesh>

        {/* Clouds Layer */}
        <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
          <sphereGeometry args={[5, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.3}
            blending={2} // Additive blending
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Atmosphere Glow (Fresnel-like effect using BackSide) */}
        <mesh scale={[1.2, 1.2, 1.2]}>
           <sphereGeometry args={[5, 64, 64]} />
           <meshBasicMaterial 
             color="#4db2ff" 
             side={BackSide} 
             transparent 
             opacity={0.15} 
           />
        </mesh>
      </group>

      <Stars radius={300} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={8} 
        maxDistance={40}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
      />
    </>
  );
};