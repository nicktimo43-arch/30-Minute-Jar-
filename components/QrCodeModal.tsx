import React, { useEffect, useRef } from 'react';

// Let TypeScript know that the QRCode library is available globally
declare var QRCode: any;

interface QrCodeModalProps {
  data: string;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ data, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, { width: 256, margin: 2 }, (error: Error | null) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [data]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-lg font-bold mb-4">Scan to Sync</h2>
        <canvas ref={canvasRef}></canvas>
        <p className="text-xs text-gray-500 mt-3 max-w-xs">Open this app on another device and use the "Scan Code" option to clone your session.</p>
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

export default QrCodeModal;
