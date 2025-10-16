import React, { useRef, useEffect } from 'react';

// Let TypeScript know that the jsQR library is available globally
declare var jsQR: any;

interface QrScannerProps {
  onScanSuccess: (data: string) => void;
  onCancel: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with null to fix TypeScript error "Expected 1 arguments, but got 0."
  const animationFrameId = useRef<number | null>(null);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScanSuccess(code.data);
            return; // Stop scanning once a code is found
          }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  };
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startScan = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
                videoRef.current.play();
                animationFrameId.current = requestAnimationFrame(tick);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please ensure you have granted permission.");
            onCancel();
        }
    };
    startScan();

    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="absolute inset-0 border-8 border-white border-opacity-25" style={{clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)'}}></div>
      <div className="z-10 absolute bottom-10">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white text-black font-semibold rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QrScanner;