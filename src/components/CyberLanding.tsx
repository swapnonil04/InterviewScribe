import { Suspense } from 'react';
import Scene3D from '@/components/Scene3D';
import { Button } from '@/components/ui/button';

// 1. Define the props interface to accept an onStart function
interface CyberLandingProps {
  onStart: () => void;
}

// 2. Destructure the onStart prop from the component's arguments
const CyberLanding = ({ onStart }: CyberLandingProps) => {
  return (
    <div className="relative min-h-screen bg-cyber-dark overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<div className="w-full h-screen bg-cyber-dark" />}>
          <Scene3D />
        </Suspense>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen bg-cyber-dark/20 backdrop-blur-sm">
        {/* Main Title */}
        <div className="text-center mb-12 px-4">
          <h1 
            className="glitch-continuous text-6xl md:text-8xl lg:text-9xl font-bold text-neon-cyan mb-6 tracking-wider transform hover:scale-105 transition-transform duration-300"
            data-text="INTERVIEWSCRIBE"
          >
            INTERVIEWSCRIBE
          </h1>
          
          <div className="relative">
            <h2 className="text-xl md:text-2xl lg:text-3xl text-neon-pink font-light tracking-[0.2em] mb-2">
              AI-POWERED INTERVIEW ASSISTANT
            </h2>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
          </div>
        </div>

        {/* Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4 max-w-4xl">
          <div className="float bg-cyber-surface/30 backdrop-blur-md border border-neon-cyan/30 rounded-lg p-6 hover:border-neon-cyan/80 hover:shadow-cyan transition-all duration-300">
            <div className="text-neon-cyan text-2xl mb-3">🤖</div>
            <h3 className="text-neon-cyan font-semibold mb-2">AI ANALYSIS</h3>
            <p className="text-foreground/80 text-sm">Real-time behavioral and speech pattern analysis</p>
          </div>
          
          <div className="float bg-cyber-surface/30 backdrop-blur-md border border-neon-pink/30 rounded-lg p-6 hover:border-neon-pink/80 hover:shadow-neon transition-all duration-300">
            <div className="text-neon-pink text-2xl mb-3">💻</div>
            <h3 className="text-neon-pink font-semibold mb-2">SMART INSIGHTS</h3>
            <p className="text-foreground/80 text-sm">Detailed feedback and improvement recommendations</p>
          </div>
          
          <div className="float bg-cyber-surface/30 backdrop-blur-md border border-neon-purple/30 rounded-lg p-6 hover:border-neon-purple/80 hover:shadow-[0_0_20px_hsl(var(--neon-purple)_/_0.5)] transition-all duration-300">
            <div className="text-neon-purple text-2xl mb-3">⚡</div>
            <h3 className="text-neon-purple font-semibold mb-2">INSTANT RESULTS</h3>
            <p className="text-foreground/80 text-sm">Get comprehensive reports in seconds</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            onClick={onStart} // 3. Use the onStart function passed in via props
            variant="cyber"
            className="glitch px-12 py-4 text-lg hover:scale-105 transition-transform duration-300"
            size="lg"
            data-text="START INTERVIEW"
          >
            <span className="relative z-10">START INTERVIEW</span>
          </Button>
          
          <p className="text-foreground/60 text-sm mt-4 tracking-wider">
            EXPERIENCE THE FUTURE OF INTERVIEWS
          </p>
        </div>

        {/* Animated Data Streams */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 60}%`,
                animation: `pulse 3s infinite ${Math.random() * 3}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-cyan" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-pink" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-purple" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-cyan" />
    </div>
  );
};

export default CyberLanding;
