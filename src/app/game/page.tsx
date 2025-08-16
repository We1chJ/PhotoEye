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
  const findNearestStreetView = useCallback((coords: {lat: number, lng: number}, callback: (found: boolean, data: any, distance?: number) => void) => {
    if (!window.google) return;
    
    const streetViewService = new google.maps.StreetViewService();
    
    // Progressive search radiuses (in meters)
    const searchRadiuses = [50, 100, 250, 500, 1000, 2000, 5000, 10000, 25000];
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
          if (fullAddress && fullAddress !== 'Address not found') {
            const addressParts = fullAddress.split(',').map(part => part.trim());
            
            // Try to find the most relevant part (usually city, then state/country)
            if (addressParts.length >= 2) {
              // Use the second-to-last part as the primary location (usually city)
              placeName = addressParts[addressParts.length - 2];
              
              // Add country if different from the city name
              const country = addressParts[addressParts.length - 1];
              if (country && country !== placeName) {
                placeName += `, ${country}`;
              }
            } else {
              // Fallback to the full address
              placeName = fullAddress;
            }
          } else {
            placeName = 'Unknown Place';
          }

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
  const updateStreetViewPosition = useCallback((newCoords: {lat: number, lng: number}) => {
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
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error);
        dispatch(setError('Failed to load Google Maps'));
        dispatch(setLoading(false));
      });
  }, [apiKey, dispatch]);

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
          console.log('📍 Got user location:', coords);
          dispatch(setCoords(coords));
          dispatch(setLoading(false));
          updateLocationName(coords.lat, coords.lng);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          dispatch(setError('Failed to get current location'));
          dispatch(setLoading(false));
          
          // Fallback to default coordinates
          console.log('📍 Using default coordinates:', DEFAULT_COORDINATES);
          dispatch(setCoords(DEFAULT_COORDINATES));
          updateLocationName(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng);
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported');
      dispatch(setError('Geolocation not supported'));
      dispatch(setLoading(false));
      
      // Fallback to default coordinates
      console.log('📍 Using default coordinates:', DEFAULT_COORDINATES);
      dispatch(setCoords(DEFAULT_COORDINATES));
      updateLocationName(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng);
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
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />

      {/* Street View Status Message */}
      {streetViewStatus.type && (
        <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-md shadow-md max-w-sm text-center ${
          streetViewStatus.type === 'error' 
            ? 'bg-red-100 text-red-800 border border-red-200'
            : streetViewStatus.type === 'info'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          <div className="text-sm">{streetViewStatus.message}</div>
          {streetViewStatus.type === 'info' && (
            <button
              onClick={() => setStreetViewStatus({ type: null, message: '' })}
              className="ml-2 text-xs underline hover:no-underline"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Display location name and coordinates */}
      {locationName && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-xl shadow-lg">
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