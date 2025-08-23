'use client'
import React, { useState } from 'react';
import { formatCoordinates } from '@/utils/localizer';
import { CaptureResult } from '@/types/type';
import { uploadImageToStorage } from '@/app/game/actions';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ImagePreviewModalProps {
  captureResult: CaptureResult;
  showImagePreview: boolean;
  setShowImagePreview: (show: boolean) => void;
  onDownload: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  captureResult,
  showImagePreview,
  setShowImagePreview,
  onDownload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  if (!showImagePreview || !captureResult.url) return null;

  // Helper function to convert base64 to Blob URL
  const getBase64BlobUrl = (base64: string): string => {
    try {
      // Extract the base64 data (remove "data:image/jpeg;base64," prefix if present)
      const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
      // Decode base64 to binary
      const binary = atob(base64Data);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      // Create Blob and URL
      const blob = new Blob([array], { type: captureResult.metadata?.mimeType || 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating Blob URL:', error);
      return base64; // Fallback to original base64 URL
    }
  };

  const handleStarClick = async () => {
    if (isUploading || isStarred) return;

    const { data, error } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (error || !user) {
      toast.error('Failed to add image to favorites.', {
        duration: 4000,
        icon: '❌'
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImageToStorage(captureResult, user);
      if (result.success) {
        setIsStarred(true);
        console.log('✅ Image successfully added to favorites');

        // Show success toast
        toast.success('Image added to favorites!', {
          description: result.message,
          duration: 3000,
          icon: '⭐'
        });
      } else {
        // Show error toast
        toast.error('Failed to save image', {
          description: result.message,
          duration: 4000,
          icon: '❌'
        });
      }
    } catch (error) {
      console.error('❌ Failed to add image to favorites:', error);

      // Show error toast
      toast.error('Failed to save image', {
        description: 'There was a problem saving your image to favorites. Please try again.',
        duration: 4000,
        icon: '❌'
      });
    } finally {
      setIsUploading(false);
    }
  }

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
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStarClick}
              disabled={isUploading || isStarred}
              className={`p-2 rounded-full transition-all duration-200 ${isStarred
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={isStarred ? 'Added to favorites' : 'Add to favorites'}
            >
              {isUploading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill={isStarred ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowImagePreview(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-8 pb-8">
          <div className="bg-gray-50 rounded-xl overflow-hidden mb-6">
            <img
              src={captureResult.url}
              alt="Captured Street View"
              className="w-full h-auto max-h-[32rem] object-contain"
              onLoad={() => console.log('✅ Image loaded successfully')}
              onError={() => {
                console.error('❌ Failed to load captured image');
                console.error('Image URL:', captureResult.url);
              }}
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="font-semibold text-gray-800 flex items-center space-x-2 text-lg">
              <span>📍</span>
              <span>{captureResult.metadata?.locationName || 'Unknown'}</span>
            </div>
            {captureResult.metadata?.lat && captureResult.metadata?.lng && (
              <div className="text-base text-gray-600 mt-2 font-mono">
                {formatCoordinates(captureResult.metadata.lat, captureResult.metadata.lng)}
              </div>
            )}
            {captureResult.metadata && (
              <div className="mt-2 text-gray-700 text-base space-y-1">
                {captureResult.metadata.capturedAt && (
                  <div>
                    <span className="font-semibold">Captured At:</span>{' '}
                    {new Date(captureResult.metadata.capturedAt).toLocaleString()}
                  </div>
                )}
                {captureResult.metadata.fov !== undefined && (
                  <div>
                    <span className="font-semibold">FOV:</span> {captureResult.metadata.fov}°
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
              href={getBase64BlobUrl(captureResult.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3 text-lg"
              onClick={(e) => {
                // Revoke the Blob URL after a short delay to clean up memory
                const blobUrl = getBase64BlobUrl(captureResult.url);
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