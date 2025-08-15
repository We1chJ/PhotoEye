'use client';

import React, { useEffect, useRef, useState } from 'react';
import { generateRandomLocation } from '@/utils/locationGenerator';

const GamePage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [locationName, setLocationName] = useState<string>('');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentCoords(coords);
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsFetchingLocation(false);
        }
      );
    } else {
      console.warn('Geolocation not supported');
      setIsFetchingLocation(false);
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    if ((window as any).google) {
      setIsLoaded(true);
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    (window as any).initGoogleMaps = () => setIsLoaded(true);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);

    return () => {
      delete (window as any).initGoogleMaps;
    };
  }, [apiKey]);

  // Initialize Street View
  useEffect(() => {
    if (!isLoaded || !currentCoords || !mapRef.current) return;
    if (panoramaRef.current) return; // already initialized

    panoramaRef.current = new google.maps.StreetViewPanorama(mapRef.current, {
      position: currentCoords,
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      linksControl: false,
      panControl: false,
      zoomControl: false,
      fullscreenControl: false,
      enableCloseButton: false,
    });

    console.log('Street View initialized at:', currentCoords);
  }, [isLoaded, currentCoords]);

  // Handle Random Location using the extracted utility function
  const handleRandomLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { name, lat, lng } = await generateRandomLocation();
      console.log('Random location:', name, lat, lng);

      const newCoords = { lat, lng };
      setCurrentCoords(newCoords);
      setLocationName(name);

      if (panoramaRef.current) {
        panoramaRef.current.setPosition(newCoords);
        panoramaRef.current.setPov({ heading: 0, pitch: 0 });
        panoramaRef.current.setZoom(1);
      }
    } catch (error) {
      console.error('Failed to generate random location:', error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />

      {/* Display location name */}
      {locationName && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white bg-opacity-80 px-4 py-2 rounded-md shadow-md">
          {locationName}
        </div>
      )}

      {/* Random Button */}
      {isLoaded && currentCoords && !isFetchingLocation && (
        <button
          onClick={handleRandomLocation}
          className="absolute top-4 right-4 z-20 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-lg transition"
        >
          🎲 Random Location
        </button>
      )}

      {/* Loading Overlay */}
      {isFetchingLocation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center animate-fade-in">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Detecting your location
            </h2>
            <p className="text-gray-600 mb-4">
              We only use your location to show nearby Street View. No data is stored.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Please allow location access in your browser, or proceed with a random location.
            </p>
            <button
              onClick={handleRandomLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Use Random Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;