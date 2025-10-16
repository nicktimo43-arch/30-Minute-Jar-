import React from 'react';
import { WeeklyRecord } from '../types';

interface WeeklyHistoryModalProps {
  history: WeeklyRecord[];
  onClose: () => void;
}

const formatDate = (dateString: string) => {
    // The date is stored as YYYY-MM-DD, which is UTC.
    // Creating a date object from it will use the browser's timezone,
    // which is what we want for displaying "Week of...".
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

const WeeklyHistoryModal: React.FC<WeeklyHistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h2 className="text-lg font-bold mb-4">Weekly Progress</h2>
        
        <div className="max-h-64 overflow-y-auto border-t border-b">
            {history.length > 0 ? (
                <ul className="divide-y">
                    {history
                        .slice() // Create a copy to avoid mutating the original
                        .sort((a, b) => b.weekOf.localeCompare(a.weekOf)) // Sort descending
                        .map((record) => (
                        <li key={record.weekOf} className="flex justify-between items-center py-3 px-2">
                            <span className="text-sm text-gray-600">Week of {formatDate(record.weekOf)}</span>
                            <span className="font-semibold text-black">{record.count} tasks</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="py-8 text-sm text-gray-500">No history yet. Complete some tasks this week to start tracking!</p>
            )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 text-black font-semibold rounded-md hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WeeklyHistoryModal;