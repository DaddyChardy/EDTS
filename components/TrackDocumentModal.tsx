import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { CloseIcon } from './icons/CloseIcon';

interface TrackDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualSubmit: (trackingNumber: string) => void;
}

export const TrackDocumentModal: React.FC<TrackDocumentModalProps> = ({ isOpen, onClose, onManualSubmit }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleScanSuccess = useCallback((data: string) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    onManualSubmit(data);
  }, [onManualSubmit]);
  
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
          try {
            const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              handleScanSuccess(code.data);
              return; // Stop scanning once a code is found
            }
          } catch (e) {
             // Silently ignore getImageData errors which can happen if canvas is tainted
          }
        }
      }
    }
    if (animationFrameId.current !== null) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [handleScanSuccess]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCameraError(null);
      const setupCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
            animationFrameId.current = requestAnimationFrame(tick);
          }
        } catch (err) {
          console.error("Error accessing camera: ", err);
          setCameraError("Could not access camera. Please grant permission and refresh the page.");
        }
      };
      setupCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, tick]);


  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onManualSubmit(trackingNumber.trim());
    }
  };

  const handleClose = () => {
    setTrackingNumber('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4"
      aria-labelledby="track-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100" id="track-modal-title">
            Track a Document
          </h3>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700">
            <CloseIcon className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label htmlFor="tracking-number-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Enter Tracking Number
            </label>
            <div className="flex gap-2">
              <input
                id="tracking-number-input"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., TDC-2024-01-123"
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <button 
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
                disabled={!trackingNumber.trim()}
              >
                Track
              </button>
            </div>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-sm">OR</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
        </div>

        <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">Scan QR Code</p>
            <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2/3 h-2/3 border-4 border-white/50 rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}></div>
                </div>
                 {cameraError && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center p-4">
                        <p className="text-white text-center text-sm">{cameraError}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
