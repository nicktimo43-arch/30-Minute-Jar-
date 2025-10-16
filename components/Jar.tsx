import React from 'react';
import type { Task } from '../types';

interface JarProps {
  tasks: Task[];
  onSell: () => void;
}

const Jar: React.FC<JarProps> = ({ tasks, onSell }) => {
  const gumballPositions = React.useMemo(() => {
    return Array.from({ length: 50 }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.sqrt(Math.random()) * 28; // Bias distribution towards center
      return {
        cx: 50 + radius * Math.cos(angle),
        cy: 40 + radius * Math.sin(angle),
      };
    });
  }, []);

  const playSellSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      // FIX: Corrected a typo from `audio-content` to `audioContext`.
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error("Could not play sell sound:", error);
    }
  };

  const handleSellClick = () => {
    if (tasks.length > 0) {
      playSellSound();
      onSell();
    }
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center space-y-2">
      <div className="relative w-28 h-40" aria-label="Gumball machine with completed tasks">
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="black"
          strokeWidth="3"
        >
          {/* Globe */}
          <circle cx="50" cy="42" r="38" />
          
          {/* Gumballs */}
          <g stroke="none" fill="black">
            {tasks.map((task, index) => (
              <circle
                key={task.id}
                cx={gumballPositions[index % gumballPositions.length].cx}
                cy={gumballPositions[index % gumballPositions.length].cy}
                r="4"
              />
            ))}
          </g>
          
          {/* Machine Body */}
          <path d="M25,80 L75,80 L80,120 L20,120 Z" fill="white" />
          <path d="M25,80 L75,80 L80,120 L20,120 Z" />
          
          {/* Base */}
          <rect x="15" y="120" width="70" height="10" rx="3" fill="white" />
          <rect x="15" y="120" width="70" height="10" rx="3" />
          
          {/* Counter Plate */}
          <g stroke="none" fill="black">
            <text x="50" y="98" fontFamily="sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle">{tasks.length}</text>
          </g>
        </svg>
      </div>
      
      <button 
        onClick={handleSellClick}
        disabled={tasks.length === 0}
        className="w-full h-8 text-sm bg-white text-black border border-black font-semibold rounded-md transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 active:bg-gray-100"
        aria-label="Sell one gumball for $1"
      >
        Sell for $1
      </button>
    </div>
  );
};

export default Jar;