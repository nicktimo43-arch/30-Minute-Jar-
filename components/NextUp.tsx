import React from 'react';
import { Task } from '../types';

interface NextUpProps {
  task: Task;
  queue: Task[];
  onPlay: () => void;
  isAnotherTaskActive: boolean;
  onEditPlan: () => void;
}

const NextUp: React.FC<NextUpProps> = ({ task, queue, onPlay, isAnotherTaskActive, onEditPlan }) => {
  const noteTitle = task.type === 'input' ? 'Consume' : 'Produce';

  return (
    <div className="border border-black rounded-lg p-4 flex flex-col w-full space-y-3">
      <div>
        <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Next Up: <span className="text-black font-bold">{noteTitle}</span></h3>
        <p className="text-lg text-black mt-1 p-2 bg-gray-100 rounded-md">{task.text}</p>
      </div>

      <button
        onClick={onPlay}
        disabled={isAnotherTaskActive}
        className="px-6 py-3 rounded-md font-bold text-white shadow-sm transition-all duration-300 w-full bg-black"
        aria-label={`Start ${noteTitle} session`}
      >
        Start Session
      </button>

      {queue.length > 0 && (
        <div className="border-t pt-2">
          <h4 className="font-semibold text-xs text-gray-500">In the Queue:</h4>
          <ul className="space-y-1 mt-1 text-sm text-gray-600">
            {queue.slice(0, 2).map((queuedTask) => (
              <li key={queuedTask.id} className="truncate">
                • {queuedTask.text}
              </li>
            ))}
            {queue.length > 2 && (
              <li className="font-medium text-xs">...and {queue.length - 2} more</li>
            )}
          </ul>
        </div>
      )}
      
      <div className="flex items-center justify-center pt-2 mt-auto border-t">
        <button onClick={onEditPlan} className="text-xs font-semibold text-gray-600 hover:text-black transition-colors underline">
            Edit Plan
        </button>
    </div>
    </div>
  );
};

export default NextUp;