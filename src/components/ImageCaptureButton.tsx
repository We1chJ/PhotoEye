'use client'
import React from 'react';

interface ImageCaptureButtonProps {
  onCapture: () => void;
}

const ImageCaptureButton: React.FC<ImageCaptureButtonProps> = ({ onCapture }) => {
  return (
    <button
      onClick={onCapture}
      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2"
    >
      <span>📸</span>
      <span>Capture</span>
    </button>
  );
};

export default ImageCaptureButton;