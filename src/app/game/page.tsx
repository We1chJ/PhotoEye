'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { generateRandomLocation } from '@/utils/locationGenerator';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLocation,
  setCoords,
  setLocationName,
  setLoading,
  setError,
  selectLocation,
  selectCoords,
  selectLocationName,
  selectIsLoading
} from '@/store/locationSlice';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const GamePage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redux state with typed hooks
  const dispatch = useAppDispatch();
  const location = useAppSelector(selectLocation);
  const currentCoords = useAppSelector(selectCoords);
  const locationName = useAppSelector(selectLocationName);
  const isFetchingLocation = useAppSelector(selectIsLoading);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;


  const locationState = useAppSelector(state => state.location);
  useEffect(() => {
    console.log('🎮 GamePage Location State:', locationState);
  }, [locationState]);
  
  // Function to update location name with debouncing
  const updateLocationName = useCallback(
    debounce(async (lat: number, lng: number) => {
      try {
        // Use the same geocoding logic from the utility
        if ((window as any).google && (window as any).google.maps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                const result = results[0];
                const addressComponents = result.address_components;
                let placeName = '';

                const priorities = ['locality', 'administrative_area_level_1', 'country'];

                for (const priority of priorities) {
                  const component = addressComponents.find(comp =>
                    comp.types.includes(priority)
                  );
                  if (component) {
                    placeName = component.long_name;
                    break;
                  }
                }

                if (placeName && !priorities.includes('country')) {
                  const countryComponent = addressComponents.find(comp =>
                    comp.types.includes('country')
                  );
                  if (countryComponent && countryComponent.long_name !== placeName) {
                    placeName += `, ${countryComponent.long_name}`;
                  }
                }

                const finalPlaceName = placeName || 'Unknown Place';

                // Only update location name, not coords (coords already updated immediately)
                dispatch(setLocationName(finalPlaceName));
              }
            }
          );
        }
      } catch (error) {
        console.error('Error updating location name:', error);
        dispatch(setError('Failed to get location name'));
      }
    }, 1000), // Debounce for 1 second
    [dispatch]
  );

  // Get user's current location
  useEffect(() => {
    dispatch(setLoading(true));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch(setCoords(coords));
          dispatch(setLoading(false));

          // Get location name for initial position
          updateLocationName(coords.lat, coords.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          dispatch(setError('Failed to get current location'));
          dispatch(setLoading(false));
        }
      );
    } else {
      console.warn('Geolocation not supported');
      dispatch(setError('Geolocation not supported'));
      dispatch(setLoading(false));
    }
  }, [dispatch, updateLocationName]);

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
      linksControl: true, // Enable navigation links
      panControl: true,   // Enable pan control
      zoomControl: true,  // Enable zoom control
      fullscreenControl: false,
      enableCloseButton: false,
    });

    // Add event listener to track position changes
    panoramaRef.current.addListener('position_changed', () => {
      if (panoramaRef.current) {
        const newPosition = panoramaRef.current.getPosition();
        if (newPosition) {
          const newCoords = {
            lat: newPosition.lat(),
            lng: newPosition.lng()
          };

          // Update coordinates immediately
          dispatch(setCoords(newCoords));
          console.log('Position changed to:', newCoords);

          // Update location name (debounced) - this won't update coords again
          updateLocationName(newCoords.lat, newCoords.lng);
        }
      }
    });

    console.log('Street View initialized at:', currentCoords);
  }, [isLoaded, currentCoords, dispatch, updateLocationName]);

  // Handle Random Location using the extracted utility function
  const handleRandomLocation = async () => {
    dispatch(setLoading(true));
    try {
      const { name, lat, lng } = await generateRandomLocation();
      console.log('Random location:', name, lat, lng);

      const newCoords = { lat, lng };

      // Update Redux store
      dispatch(setLocation({
        coords: newCoords,
        locationName: name
      }));

      if (panoramaRef.current) {
        panoramaRef.current.setPosition(newCoords);
        panoramaRef.current.setPov({ heading: 0, pitch: 0 });
        panoramaRef.current.setZoom(1);
      }
    } catch (error) {
      console.error('Failed to generate random location:', error);
      dispatch(setError('Failed to generate random location'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />

      {/* Display location name and coordinates */}
      {locationName && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-md">
          <div className="font-semibold">{locationName}</div>
          {currentCoords && (
            <div className="text-xs text-gray-600 mt-1">
              {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            </div>
          )}
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