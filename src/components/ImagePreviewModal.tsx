'use client'
import React from 'react';
import { formatCoordinates } from '@/utils/localizer';

interface ImagePreviewModalProps {
  capturedImage: string | null;
  showImagePreview: boolean;
  setShowImagePreview: (show: boolean) => void;
  locationName: string | null;
  currentCoords: { lat: number; lng: number } | null;
  onDownload: () => void;
  metadata?: {
    capturedAt?: string;
    fov?: number;
    zoom?: number;
    [key: string]: any;
  };
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  capturedImage,
  showImagePreview,
  setShowImagePreview,
  locationName,
  currentCoords,
  onDownload,
  metadata,
}) => {
  if (!showImagePreview || !capturedImage) return null;

  // Helper function to convert base64 to Blob URL
  const getBase64BlobUrl = (base64: string): string => {
    try {
      // Extract the base64 data (remove "data:image/png;base64," prefix if present)
      const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
      // Decode base64 to binary
      const binary = atob(base64Data);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      // Create Blob and URL
      const blob = new Blob([array], { type: 'image/png' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating Blob URL:', error);
      return base64; // Fallback to original base64 URL
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowImagePreview(false);
        }
      }}
    >
      <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-4xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between px-8 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📸</span>
            <h2 className="text-2xl font-bold text-gray-800">Street View Captured</h2>
          </div>
          <button
            onClick={() => setShowImagePreview(false)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="bg-gray-50 rounded-xl overflow-hidden mb-6">
            <img
              src={capturedImage}
              alt="Captured Street View"
              className="w-full h-auto max-h-[32rem] object-contain"
              onLoad={() => console.log('✅ Image loaded successfully')}
              onError={() => {
                console.error('❌ Failed to load captured image');
                console.error('Image URL:', capturedImage);
              }}
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="font-semibold text-gray-800 flex items-center space-x-2 text-lg">
              <span>📍</span>
              <span>{locationName || 'Unknown'}</span>
            </div>
            {currentCoords && (
              <div className="text-base text-gray-600 mt-2 font-mono">
                {formatCoordinates(currentCoords.lat, currentCoords.lng)}
              </div>
            )}
            {metadata && (
              <div className="mt-2 text-gray-700 text-base space-y-1">
                {metadata.capturedAt && (
                  <div>
                    <span className="font-semibold">Captured At:</span>{' '}
                    {new Date(metadata.capturedAt).toLocaleString()}
                  </div>
                )}
                {metadata.fov !== undefined && (
                  <div>
                    <span className="font-semibold">FOV:</span> {metadata.fov}°
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onDownload}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download</span>
            </button>
            <button
              onClick={() => setShowImagePreview(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-lg font-medium transition-colors text-lg"
            >
              Close
            </button>
            <a
              href={getBase64BlobUrl(capturedImage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3 text-lg"
              onClick={(e) => {
                // Revoke the Blob URL after a short delay to clean up memory
                const blobUrl = getBase64BlobUrl(capturedImage);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Open</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;