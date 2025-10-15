import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
}

const playResumeSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a rising pitch effect
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.linearRampToValueAtTime(800, now + 0.15);

    // Create a smooth volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);


    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch (error) {
    console.error("Could not play resume sound:", error);
  }
};


const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => {
  const handleResumeClick = () => {
    playResumeSound();
    onResume();
  };
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
      <div className="text-center p-8">
        <h2 className="text-4xl font-serif italic text-gray-700 mb-8">
          "If you don't start now, you'll never do it."
        </h2>
        <button
          onClick={handleResumeClick}
          className="px-10 py-4 bg-green-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-600 transform hover:scale-105 transition-transform duration-200"
        >
          Resume
        </button>
        <div className="mt-8 p-4 bg-yellow-100 shadow-inner w-96 mx-auto" style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
        }}>
            <p className="font-serif text-gray-600 text-center">If you want to continue, press on resume.</p>
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;