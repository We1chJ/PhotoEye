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
import {
  getAddressFromLatLng,
  createGeocoder,
  loadGoogleMapsScript,
  formatCoordinates,
  DEFAULT_COORDINATES,
  type LocationData
} from '@/utils/localizer';

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
  const [isUpdatingFromRedux, setIsUpdatingFromRedux] = useState(false);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [streetViewStatus, setStreetViewStatus] = useState<{
    type: 'success' | 'info' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  // New state to differentiate loading types
  const [loadingType, setLoadingType] = useState<'initial' | 'random' | null>(null);

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

  // Function to find nearest available Street View with progressive search
  const findNearestStreetView = useCallback((coords: { lat: number, lng: number }, callback: (found: boolean, data: any, distance?: number) => void) => {
    if (!window.google) return;

    const streetViewService = new google.maps.StreetViewService();

    // Progressive search radiuses (in meters)
    const searchRadiuses = [50, 100, 250, 500, 1000, 2000, 5000, 10000];
    let currentRadiusIndex = 0;

    const searchAtRadius = (radiusIndex: number) => {
      if (radiusIndex >= searchRadiuses.length) {
        // No Street View found within maximum radius
        callback(false, null);
        return;
      }

      const radius = searchRadiuses[radiusIndex];
      console.log(`🔍 Searching for Street View within ${radius}m of coordinates:`, coords);

      streetViewService.getPanorama({
        location: coords,
        radius: radius,
        source: google.maps.StreetViewSource.OUTDOOR
      }, (data, status) => {
        if (status === 'OK' && data && data.location) {
          // Calculate actual distance to found panorama
          const foundLocation = data.location.latLng;
          if (foundLocation) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(coords.lat, coords.lng),
              foundLocation
            );

            console.log(`✅ Found Street View ${Math.round(distance)}m away at:`, {
              lat: foundLocation.lat(),
              lng: foundLocation.lng()
            });

            callback(true, data, distance);
          } else {
            callback(true, data);
          }
        } else {
          // Try next radius
          console.log(`❌ No Street View found within ${radius}m, trying larger radius...`);
          searchAtRadius(radiusIndex + 1);
        }
      });
    };

    // Start searching
    searchAtRadius(currentRadiusIndex);
  }, []);

  // Function to update location name with debouncing using localizer
  const updateLocationName = useCallback(
    debounce(async (lat: number, lng: number) => {
      if (!geocoder) {
        console.warn('Geocoder not available');
        return;
      }

      try {
        console.log('🔄 Updating location name for:', { lat, lng });

        // Use the localizer function instead of inline geocoding
        getAddressFromLatLng(geocoder, lat, lng, (locationData: LocationData) => {
          console.log('📍 Received location data:', locationData);

          // Extract a cleaner place name from the full address
          const fullAddress = locationData.address;
          let placeName = '';

          // Try to get a more user-friendly name by parsing the address
          placeName = fullAddress || 'Unknown Place';

          console.log('✅ Setting location name to:', placeName);
          dispatch(setLocationName(placeName));
        });
      } catch (error) {
        console.error('Error updating location name:', error);
        dispatch(setError('Failed to get location name'));
      }
    }, 1000),
    [dispatch, geocoder]
  );

  // Enhanced function to update Street View position with nearest search fallback
  const updateStreetViewPosition = useCallback((newCoords: { lat: number, lng: number }) => {
    if (!panoramaRef.current) return;

    console.log('🔄 Finding nearest Street View to:', newCoords);

    findNearestStreetView(newCoords, (found, data, distance) => {
      if (found && data && panoramaRef.current) {
        const actualLocation = data.location?.latLng;
        if (actualLocation) {
          const actualCoords = {
            lat: actualLocation.lat(),
            lng: actualLocation.lng()
          };

          setIsUpdatingFromRedux(true);

          panoramaRef.current.setPosition(actualCoords);
          panoramaRef.current.setPov({ heading: 0, pitch: 0 });
          panoramaRef.current.setZoom(1);

          // Update Redux with the actual coordinates
          dispatch(setCoords(actualCoords));

          // Show message if we moved significantly from original coordinates
          if (distance && distance > 100) {
            const distanceKm = (distance / 1000).toFixed(1);
            setStreetViewStatus({
              type: 'info',
              message: `Moved to nearest Street View (${distanceKm}km away)`
            });
            console.log(`📍 Moved ${Math.round(distance)}m from original coordinates`);
          } else {
            setStreetViewStatus({ type: 'success', message: 'Street View loaded successfully' });
            // Clear success message after 3 seconds
            setTimeout(() => setStreetViewStatus({ type: null, message: '' }), 3000);
          }

          // Update location name for the actual position
          updateLocationName(actualCoords.lat, actualCoords.lng);

          setTimeout(() => setIsUpdatingFromRedux(false), 100);
        }
      } else {
        console.log('❌ No Street View found within 25km radius');
        setStreetViewStatus({
          type: 'error',
          message: 'No Street View available within 25km of this location'
        });
      }
    });
  }, [findNearestStreetView, dispatch, updateLocationName]);

  // Load Google Maps script using localizer utility
  useEffect(() => {
    if (!apiKey) {
      const errorMsg = 'Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAP_KEY in your .env file.';
      dispatch(setError(errorMsg));
      return;
    }

    dispatch(setLoading(true));
    setLoadingType('initial');

    loadGoogleMapsScript(apiKey, ['geometry']) // Add geometry library for distance calculations
      .then(() => {
        console.log('✅ Google Maps script loaded successfully');
        setIsLoaded(true);

        // Create geocoder instance using localizer utility
        const geocoderInstance = createGeocoder();
        if (geocoderInstance) {
          setGeocoder(geocoderInstance);
          console.log('✅ Geocoder instance created successfully');
        } else {
          console.warn('⚠️ Failed to create geocoder instance');
        }

        dispatch(setLoading(false));
        setLoadingType(null);
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error);
        dispatch(setError('Failed to load Google Maps'));
        dispatch(setLoading(false));
        setLoadingType(null);
      });
  }, [apiKey, dispatch]);

  // Get user's current location
  useEffect(() => {
    dispatch(setLoading(true));
    setLoadingType('initial');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('📍 Got user location:', coords);
          dispatch(setCoords(coords));
          dispatch(setLoading(false));
          setLoadingType(null);
          updateLocationName(coords.lat, coords.lng);
        },
        (error) => {
          console.log('📍 User location access:', error.code === 1 ? 'denied by user' : 'failed');
          
          // Only stop loading, don't set any coordinates or errors if user denied permission
          dispatch(setLoading(false));
          setLoadingType(null);
          
          // Don't set any fallback coordinates - let user choose to use random location button
          if (error.code !== 1) { // Not a permission denied error
            console.error('❌ Geolocation error:', error);
            dispatch(setError('Location access failed. Use "Random Location" to start exploring.'));
          }
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported');
      dispatch(setLoading(false));
      setLoadingType(null);
      // Don't set error or fallback coordinates - let user choose random location
    }
  }, [dispatch, updateLocationName]);

  // Initialize Street View with event listeners
  useEffect(() => {
    if (!isLoaded || !currentCoords || !mapRef.current) return;
    if (panoramaRef.current) return; // already initialized

    console.log('🎮 Initializing Street View at:', currentCoords);

    panoramaRef.current = new google.maps.StreetViewPanorama(mapRef.current, {
      position: currentCoords,
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      linksControl: true,
      panControl: true,
      zoomControl: true,
      fullscreenControl: false,
      enableCloseButton: false,
    });

    // Event listener for successful panorama load
    panoramaRef.current.addListener('pano_changed', () => {
      console.log('📷 Panorama changed - new imagery loaded');
      const panoId = panoramaRef.current?.getPano();
      if (panoId) {
        console.log('✅ Street View loaded successfully, pano ID:', panoId);
        // Clear any previous error status
        setStreetViewStatus({ type: null, message: '' });
      }
    });

    // Event listener for position changes
    panoramaRef.current.addListener('position_changed', () => {
      if (isUpdatingFromRedux) {
        console.log('🔄 Skipping position update - updating from Redux');
        return;
      }

      if (panoramaRef.current) {
        const newPosition = panoramaRef.current.getPosition();
        if (newPosition) {
          const newCoords = {
            lat: newPosition.lat(),
            lng: newPosition.lng()
          };

          console.log('📍 Street View position changed to:', newCoords);
          dispatch(setCoords(newCoords));
          updateLocationName(newCoords.lat, newCoords.lng);
        }
      }
    });

    // Event listener for status changes
    panoramaRef.current.addListener('status_changed', () => {
      if (panoramaRef.current) {
        const status = panoramaRef.current.getStatus();
        console.log('🔄 Street View status changed:', status);

        if (status !== 'OK') {
          console.log('❌ Street View error:', status);
          setStreetViewStatus({
            type: 'error',
            message: `Street View unavailable: ${status}`
          });
        }
      }
    });

    console.log('✅ Street View initialized successfully at:', currentCoords);
  }, [isLoaded, currentCoords, dispatch, updateLocationName, isUpdatingFromRedux]);

  // Update Street View when Redux location changes with availability check
  useEffect(() => {
    if (!panoramaRef.current || !currentCoords) return;

    const currentPosition = panoramaRef.current.getPosition();
    if (currentPosition) {
      const currentLat = currentPosition.lat();
      const currentLng = currentPosition.lng();

      const tolerance = 0.000001;
      const latDiff = Math.abs(currentLat - currentCoords.lat);
      const lngDiff = Math.abs(currentLng - currentCoords.lng);

      if (latDiff > tolerance || lngDiff > tolerance) {
        console.log('🔄 Redux coordinates changed, updating Street View position');
        updateStreetViewPosition(currentCoords);
      }
    } else {
      console.log('🔄 No current position, updating Street View to new coordinates');
      updateStreetViewPosition(currentCoords);
    }
  }, [currentCoords, updateStreetViewPosition]);

  // Handle Random Location
  const handleRandomLocation = async () => {
    console.log('🎲 Generating random location...');
    dispatch(setLoading(true));
    setLoadingType('random');

    try {
      const { name, lat, lng } = await generateRandomLocation();
      console.log('🎲 Random location generated:', { name, lat, lng });

      const newCoords = { lat, lng };

      dispatch(setLocation({
        coords: newCoords,
        locationName: name
      }));

      console.log('✅ Random location set in Redux');
    } catch (error) {
      console.error('❌ Failed to generate random location:', error);
      dispatch(setError('Failed to generate random location'));
    } finally {
      dispatch(setLoading(false));
      setLoadingType(null);
    }
  };

  // Initial Location Permission Loading Overlay
  const InitialLocationOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md text-center relative z-10">
        {/* Location icon with pulse animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-white bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
          Welcome to Street Explorer
        </h2>
        <p className="text-white/80 mb-4 leading-relaxed">
          We'd like to show you Street View near your location to get started on your virtual adventure.
        </p>
        <div className="text-white/60 text-sm mb-6 bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy Protected
          </div>
          Your location is only used for Street View and never stored or shared. You can also skip this step.
        </div>
        <button
          onClick={handleRandomLocation}
          className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center">
            <span className="mr-2">🎲</span>
            Start with Random Location
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );

  // Random Location Loading Overlay
  const RandomLocationOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-900 to-cyan-900 flex items-center justify-center z-50">
      {/* Animated globe/world elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s'
            }}
          ></div>
        ))}
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-sm text-center relative z-10">
        {/* Spinning globe icon */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center animate-spin">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-teal-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full transform -translate-x-1/2 translate-y-1"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-white">
          🌍 Exploring the World
        </h2>
        <div className="space-y-3 text-teal-100">
          <div className="flex items-center justify-center animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
          <p className="text-lg font-medium">Finding your next adventure...</p>
          <div className="text-sm text-teal-200 bg-white/10 rounded-lg p-3 border border-white/20">
            Searching amazing locations across the globe
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />

      {/* Collapsible Location Panel */}
      {locationName && (
        <div className="group absolute top-0 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 ease-in-out">
          {/* Main panel - slides down on hover */}
          <div className="bg-black/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-b-xl shadow-lg transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
            <div className="text-center">
              <div className="text-white/80 text-sm font-medium mb-1">You are at:</div>
              <div className="font-bold text-white text-lg mb-2">{locationName}</div>
              {currentCoords && (
                <div className="text-white/70 text-xs font-mono bg-black/20 px-3 py-1 rounded-full">
                  {formatCoordinates(currentCoords.lat, currentCoords.lng)}
                </div>
              )}
            </div>
          </div>
          {/* Arrow tab - always visible, fixed at the top center */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-30 bg-black/20 backdrop-blur-md border-x border-b border-white/30 px-8 py-1 rounded-b-lg mx-auto w-fit cursor-pointer group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-300">
            <div className="text-white/60 text-sm transform group-hover:rotate-180 transition-transform duration-300">
              ▼
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Street View Status Messages */}
      {streetViewStatus.type && (
        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 px-6 py-4 rounded-lg shadow-lg max-w-md text-center transition-all duration-300 ${streetViewStatus.type === 'error'
            ? 'bg-red-500/90 text-white border-2 border-red-400 backdrop-blur-sm'
            : streetViewStatus.type === 'info'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
          <div className={`font-semibold ${streetViewStatus.type === 'error' ? 'text-lg' : 'text-sm'}`}>
            {streetViewStatus.type === 'error' && '⚠️ '}
            {streetViewStatus.message}
          </div>
          {streetViewStatus.type === 'error' && (
            <div className="text-sm text-red-100 mt-2">
              Try clicking "Random Location" to find a place with Street View
            </div>
          )}
          {(streetViewStatus.type === 'info' || streetViewStatus.type === 'error') && (
            <button
              onClick={() => setStreetViewStatus({ type: null, message: '' })}
              className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors ${streetViewStatus.type === 'error'
                  ? 'bg-red-600/50 hover:bg-red-600/70 text-white'
                  : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                }`}
            >
              ✕ Dismiss
            </button>
          )}
        </div>
      )}

      {/* Random Button */}
      {isLoaded && currentCoords && !isFetchingLocation && (
        <button
          onClick={handleRandomLocation}
          className="absolute top-4 right-4 z-20 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          🎲 Random Location
        </button>
      )}

      {/* Conditional Loading Overlays - Only show initial overlay when actually loading */}
      {isFetchingLocation && loadingType === 'initial' && <InitialLocationOverlay />}
      {isFetchingLocation && loadingType === 'random' && <RandomLocationOverlay />}
      
      {/* Show initial overlay when no coordinates are set and not currently loading */}
      {!isFetchingLocation && !currentCoords && <InitialLocationOverlay />}
    </div>
  );
};

export default GamePage;