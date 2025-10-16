import React from 'react';
import { TimerState } from '../types';

interface TimerScreenProps {
  timeRemaining: number;
  totalTime: number;
  timerState: TimerState;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  taskText: string;
}

const playClickSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};

const playCancelSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error("Could not play cancel sound:", error);
  }
};

const TimerScreen: React.FC<TimerScreenProps> = ({ timeRemaining, totalTime, timerState, onPause, onResume, onCancel, taskText }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = (timeRemaining / totalTime) * 100;

  const handlePauseResumeClick = () => {
    playClickSound();
    if (timerState === 'running') {
      onPause();
    } else {
      onResume();
    }
  };

  const handleCancelClick = () => {
    playCancelSound();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
      
      <div className="text-center text-white">
        <p className="text-md text-gray-400 uppercase tracking-wider">Focusing On</p>
        <p className="mt-1 text-2xl font-sans max-w-sm break-words">{taskText}</p>
      </div>
      
      <div className="relative my-12">
        <svg className="transform -rotate-90" width="200" height="200" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="white"
            strokeWidth="12"
            strokeDasharray={`${(progress * 339.29) / 100} 339.29`}
            strokeLinecap="round"
            style={{transition: 'stroke-dasharray 1s linear'}}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-5xl font-mono font-bold text-white`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <button
          onClick={handleCancelClick}
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Cancel current task"
        >
          Cancel
        </button>
        <button 
          onClick={handlePauseResumeClick} 
          className="w-20 h-20 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-xl flex items-center justify-center"
        >
          {timerState === 'running' ? 'Pause' : 'Resume'}
        </button>
      </div>

    </div>
  );
};

export default TimerScreen;