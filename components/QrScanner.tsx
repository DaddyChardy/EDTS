import React, { useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { CloseIcon } from './icons/CloseIcon';

interface QrScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with null to provide an argument, resolving an error where the 0-argument overload might not be supported.
  const animationFrameId = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        const canvas = canvasElement.getContext('2d', { willReadFrequently: true });
        if (canvas) {
          canvasElement.height = video.videoHeight;
          canvasElement.width = video.videoWidth;
          canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
          const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code) {
            onScanSuccess(code.data);
            return; // Stop scanning once a code is found
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  }, [onScanSuccess]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
          videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access camera. Please ensure you have granted permission.");
        onClose();
      }
    };

    setupCamera();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tick, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="relative w-full max-w-lg mx-auto">
        <video ref={videoRef} className="w-full h-auto rounded-lg shadow-xl" playsInline />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}></div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75" aria-label="Close scanner">
          <CloseIcon className="w-6 h-6" />
        </button>
        <p className="text-white text-center mt-4 font-medium" aria-hidden="true">Point your camera at a QR code</p>
      </div>
    </div>
  );
};
