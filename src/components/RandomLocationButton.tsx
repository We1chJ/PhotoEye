'use client'
import React from 'react';

interface RandomLocationButtonProps {
  onRandomLocation: () => void;
}

const RandomLocationButton: React.FC<RandomLocationButtonProps> = ({ onRandomLocation }) => {
  return (
    <button
      onClick={onRandomLocation}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
    >
      🎲 Random Location
    </button>
  );
};

export default RandomLocationButton;