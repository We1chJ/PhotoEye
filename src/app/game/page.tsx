'use client'

import React, { useEffect, useRef, useState } from 'react'

const GamePage = () => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [panorama, setPanorama] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google) {
      initializeStreetView();
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    // Create global callback before loading script
    window.initGoogleMaps = () => {
      setIsLoaded(true);
      initializeStreetView();
    };

    // Load Google Maps script (removed places library since we're not using autocomplete)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [apiKey]);

  const initializeStreetView = async () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Initialize Street View
      const streetViewPanorama = new window.google.maps.StreetViewPanorama(mapRef.current, {
        position: { lat: 40.749933, lng: -73.98633 }, // New York City
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        linksControl: false,
        panControl: false,
        zoomControl: false,
        fullscreenControl: false,
        enableCloseButton: false,
      });

      setPanorama(streetViewPanorama);

      console.log('Street View initialized!');

    } catch (error) {
      console.error('Error initializing Street View:', error);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Street View Container */}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full bg-gray-100"
      />
    </div>
  );
};

export default GamePage;