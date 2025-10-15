import React from 'react';
import type { NoteType } from '../types';

interface StickyNoteProps {
  noteType: NoteType;
  color: string;
  text: string;
  onTextChange: (text: string) => void;
  onPlay: (noteType: NoteType, text: string) => void;
  isAnotherTaskActive: boolean;
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
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};


const StickyNote: React.FC<StickyNoteProps> = ({
  noteType,
  color,
  text,
  onTextChange,
  onPlay,
  isAnotherTaskActive,
}) => {
  const canPlay = text.trim().length > 0;

  const handlePlayClick = () => {
    playClickSound();
    onPlay(noteType, text);
  };

  return (
    <div className={`relative flex flex-col items-center p-4 w-56 h-56 shadow-lg transform transition-transform duration-200 focus-within:scale-110 hover:scale-110 ${color}`}
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
      }}
    >
      <h3 className="font-bold capitalize mb-2 border-b border-gray-500/30 w-full text-center pb-1">{noteType}</h3>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Write your task here..."
        className="flex-grow w-full bg-transparent resize-none focus:outline-none p-2 font-serif text-gray-700"
        disabled={isAnotherTaskActive}
      />
      <button
        onClick={handlePlayClick}
        disabled={!canPlay || isAnotherTaskActive}
        className={`mt-2 px-6 py-2 rounded-full font-bold text-white shadow-md transition-all duration-300 ${
          canPlay ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Play
      </button>
    </div>
  );
};

export default StickyNote;