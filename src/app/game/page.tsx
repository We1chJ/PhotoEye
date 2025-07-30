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

    // Load Google Maps script with places library
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
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
        // addressControl: false,
        fullscreenControl: false,
        // clickToGo: false,
        // scrollwheel: false,
        enableCloseButton: false,
      });

      setPanorama(streetViewPanorama);

      // Request needed libraries for Places Autocomplete
      const [{ PlaceAutocompleteElement }] = await Promise.all([
        //@ts-ignore
        google.maps.importLibrary("places")
      ]);

      // Create the official Google Places Autocomplete Element
      const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
      placeAutocomplete.id = 'place-autocomplete-input';
      placeAutocomplete.locationBias = { lat: 40.749933, lng: -73.98633 };

      // Create search card container
      const card = document.getElementById('place-autocomplete-card');
      if (card) {
        card.appendChild(placeAutocomplete);
      }

      // Add event listener for place selection
      placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });

        // Move Street View to the selected location
        if (place.location) {
          streetViewPanorama.setPosition(place.location);
          streetViewPanorama.setPov({
            heading: 0,
            pitch: 0
          });

          console.log('Moved Street View to:', place.displayName, place.formattedAddress);
        }
      });

      console.log('Street View with official Google Places Autocomplete initialized!');

    } catch (error) {
      console.error('Error initializing Street View:', error);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Official Google Places Autocomplete Card */}
      <div
        id="place-autocomplete-card"
        className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-2.5 w-80 font-sans"
      >
        {/* The Google Places Autocomplete Element will be inserted here */}
      </div>

      {/* Street View Container */}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full bg-gray-100"
      />
    </div>
  );
};

export default GamePage;