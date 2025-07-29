'use client'

import React, { useEffect, useRef, useState } from 'react'

const GamePage = () => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Move API key to client-side only to avoid hydration mismatch
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

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [apiKey]);

  const initializeStreetView = () => {
    if (!mapRef.current || !window.google) return;

    const mapStyles = [
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      },
      // Add more custom styles here
    ];

    const panorama = new window.google.maps.StreetViewPanorama(mapRef.current, {
      position: { lat: 37.869260, lng: -122.254811 },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      linksControl: false, // Removes navigation arrows
      panControl: false,
      zoomControl: false,
      addressControl: false,
      fullscreenControl: false,
      clickToGo: true,
      scrollwheel: false,
    });

    console.log('Street View initialized successfully!');
  };

  return (
    <div
      ref={mapRef}
      style={{ 
        width: "100vw", 
        height: "100vh", 
        position: "fixed", 
        top: 0, 
        left: 0,
        backgroundColor: '#f0f0f0' // Loading background
      }}
    />
  );
};

export default GamePage;