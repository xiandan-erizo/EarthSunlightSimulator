import React, { useState, Suspense, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EarthScene } from './components/EarthScene';
import { ControlPanel } from './components/ControlPanel';
import { analyzeSolarSituation } from './services/geminiService';
import { GeminiAnalysis } from './types';

export default function App() {
  // Initialize state with current UTC time
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const currentDayOfYear = Math.floor(diff / oneDay);
  
  const [hour, setHour] = useState<number>(now.getUTCHours() + now.getUTCMinutes() / 60);
  const [dayOfYear, setDayOfYear] = useState<number>(currentDayOfYear);
  
  // Auto-play state
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const lastTimeRef = useRef<number>(Date.now());
  
  // Speed of simulation: How many simulated hours pass per real second
  // 0.5 means 1 real second = 30 simulated minutes.
  const simulationSpeed = 0.2; 

  const [analysis, setAnalysis] = useState<GeminiAnalysis>({
    loading: false,
    text: null,
    error: null
  });

  // Animation Loop for Time
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (isAutoPlaying) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTimeRef.current) / 1000; // in seconds
        lastTimeRef.current = currentTime;

        setHour((prevHour) => {
          const newHour = prevHour + deltaTime * simulationSpeed;
          return newHour >= 24 ? newHour - 24 : newHour;
        });
      } else {
        // Keep timestamp updated even when paused so we don't jump when resuming
        lastTimeRef.current = Date.now(); 
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoPlaying]);

  // Calculate current date object based on sliders for the API
  const simulatedDate = useMemo(() => {
    const date = new Date(new Date().getFullYear(), 0); // Jan 1
    date.setDate(dayOfYear + 1);
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    date.setUTCHours(h, m);
    return date;
  }, [hour, dayOfYear]);

  const handleAnalyze = async () => {
    // Pause when analyzing
    setIsAutoPlaying(false);
    setAnalysis({ loading: true, text: null, error: null });
    
    const maxDeclination = 23.44;
    const declination = -maxDeclination * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);

    try {
      const text = await analyzeSolarSituation(simulatedDate, declination);
      setAnalysis({ loading: false, text, error: null });
    } catch (err) {
      setAnalysis({ loading: false, text: null, error: (err as Error).message });
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* UI Layer */}
      <ControlPanel
        date={simulatedDate}
        setDate={() => {}} 
        hour={hour}
        setHour={(h) => {
          setHour(h);
          setIsAutoPlaying(false); // Stop auto-play on manual interaction
        }}
        dayOfYear={dayOfYear}
        setDayOfYear={(d) => {
          setDayOfYear(d);
          setIsAutoPlaying(false);
        }}
        isAutoPlaying={isAutoPlaying}
        setIsAutoPlaying={setIsAutoPlaying}
        onAnalyze={handleAnalyze}
        analysis={analysis}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <EarthScene hour={hour} dayOfYear={dayOfYear} />
          </Suspense>
        </Canvas>
      </div>

      {/* Loading Overlay for Assets */}
      <div className="absolute bottom-4 right-4 text-gray-500 text-xs font-mono pointer-events-none select-none">
        Built with React Three Fiber & Gemini
      </div>
    </div>
  );
}