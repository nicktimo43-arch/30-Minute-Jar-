import React from 'react';

interface SyncModalProps {
  onClose: () => void;
  onShowCode: () => void;
  onScanCode: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ onClose, onShowCode, onScanCode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center space-y-4">
        <h2 className="text-lg font-bold">Sync Devices</h2>
        <p className="text-sm text-gray-600">Clone your session data to another device.</p>
        <div className="space-y-2">
            <button
              onClick={onShowCode}
              className="w-full px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors"
            >
              Show My Code
            </button>
            <button
              onClick={onScanCode}
              className="w-full px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors"
            >
              Scan Code
            </button>
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full px-4 py-2 bg-gray-200 text-black font-semibold rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SyncModal;
