import React from 'react';

interface MainTaskNoteProps {
  text: string;
  onTextChange: (text: string) => void;
  isTaskActive: boolean;
}

const MainTaskNote: React.FC<MainTaskNoteProps> = ({ text, onTextChange, isTaskActive }) => {
  return (
    <div className="w-full">
        <label htmlFor="main-task-input" className="block text-center text-xs font-semibold mb-1 text-gray-500">
            High-Priority Task
        </label>
        <textarea
            id="main-task-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="What is your main goal?"
            className="w-full bg-white border border-black rounded-lg resize-none focus:outline-none p-2 font-sans text-black focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
            rows={2}
            disabled={isTaskActive}
            aria-label="Main task goal input"
        />
    </div>
  );
};

export default MainTaskNote;