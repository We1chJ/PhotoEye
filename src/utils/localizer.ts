'use client'
/**
 * localizer.ts - Location and geocoding utilities
 * Extracted from MapDrawer component for reusability
 */

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface GeocodeResult {
  success: boolean;
  locationData?: LocationData;
  error?: string;
}

/**
 * Get address from coordinates using Google Maps Geocoder
 * @param geocoderInstance - Google Maps Geocoder instance
 * @param position - Google Maps LatLng position object
 * @param callback - Callback function to handle the result
 */
export const getAddressFromPosition = (
  geocoderInstance: google.maps.Geocoder,
  position: google.maps.LatLng,
  callback: (locationData: LocationData) => void
): void => {
  geocoderInstance.geocode(
    { location: position },
    (results, status) => {
      let address = 'Address not found';
      if (status === 'OK' && results?.[0]) {
        address = results[0].formatted_address;
      }
      
      const locationData: LocationData = {
        lat: position.lat(),
        lng: position.lng(),
        address: address
      };
      
      callback(locationData);
    }
  );
};

/**
 * Get address from latitude and longitude coordinates
 * @param geocoderInstance - Google Maps Geocoder instance
 * @param lat - Latitude
 * @param lng - Longitude
 * @param callback - Callback function to handle the result
 */
export const getAddressFromLatLng = (
  geocoderInstance: google.maps.Geocoder,
  lat: number,
  lng: number,
  callback: (locationData: LocationData) => void
): void => {
  const position = { lat: lat, lng: lng };
  
  geocoderInstance.geocode(
    { location: position },
    (results, status) => {
      let address = 'Address not found';
      if (status === 'OK' && results?.[0]) {
        address = results[0].formatted_address;
      }
      
      const locationData: LocationData = {
        lat: lat,
        lng: lng,
        address: address
      };
      
      callback(locationData);
    }
  );
};

/**
 * Geocode an address string to get coordinates and formatted address
 * @param geocoderInstance - Google Maps Geocoder instance
 * @param address - Address string to geocode
 * @param callback - Callback function to handle the result
 */
export const geocodeAddress = (
  geocoderInstance: google.maps.Geocoder,
  address: string,
  callback: (result: GeocodeResult) => void
): void => {
  geocoderInstance.geocode({ address: address }, (results, status) => {
    if (status === 'OK' && results?.[0]) {
      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      const formattedAddress = results[0].formatted_address;
      
      callback({
        success: true,
        locationData: {
          lat: lat,
          lng: lng,
          address: formattedAddress
        }
      });
    } else {
      callback({
        success: false,
        error: `Geocoding failed: ${status}`
      });
    }
  });
};

/**
 * Update marker position and animate it
 * @param marker - Google Maps Marker instance
 * @param position - New position for the marker
 * @param animationDuration - Duration of bounce animation in milliseconds (default: 750)
 */
export const updateMarkerPosition = (
  marker: google.maps.Marker,
  position: google.maps.LatLng | google.maps.LatLngLiteral,
  animationDuration: number = 750
): void => {
  // Update marker position
  marker.setPosition(position);
  
  // Animate marker
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(() => {
    marker.setAnimation(null);
  }, animationDuration);
};

/**
 * Combined function to update marker and get location info
 * This is the main function used in your original code
 * @param geocoderInstance - Google Maps Geocoder instance
 * @param position - Google Maps LatLng position object
 * @param marker - Google Maps Marker instance
 * @param onLocationSelect - Callback function to handle location selection
 */
export const updateMarkerAndLocation = (
  geocoderInstance: google.maps.Geocoder,
  position: google.maps.LatLng,
  marker: google.maps.Marker,
  onLocationSelect: (locationData: LocationData) => void
): void => {
  // Update marker position with animation
  updateMarkerPosition(marker, position);
  
  // Get address from coordinates
  getAddressFromPosition(geocoderInstance, position, onLocationSelect);
};

/**
 * Load Google Maps script dynamically
 * @param apiKey - Google Maps API key
 * @param libraries - Array of Google Maps libraries to load (default: ['places'])
 * @returns Promise that resolves when script is loaded
 */
export const loadGoogleMapsScript = (
  apiKey: string,
  libraries: string[] = ['places']
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // If script exists but not loaded yet, wait for it
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      
      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google || !window.google.maps) {
          reject(new Error('Timeout loading Google Maps API'));
        }
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));

    document.head.appendChild(script);
  });
};

/**
 * Create a Google Maps Geocoder instance
 * @returns Google Maps Geocoder instance or null if not available
 */
export const createGeocoder = (): google.maps.Geocoder | null => {
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    return new window.google.maps.Geocoder();
  }
  return null;
};

/**
 * Format coordinates to a specific number of decimal places
 * @param lat - Latitude
 * @param lng - Longitude
 * @param decimals - Number of decimal places (default: 6)
 * @returns Formatted coordinate string
 */
export const formatCoordinates = (
  lat: number,
  lng: number,
  decimals: number = 6
): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

/**
 * Default coordinates for Springfield, Massachusetts
 */
export const DEFAULT_COORDINATES = {
    lat: 40.6892,
    lng: -74.0445,
    address: 'Statue of Liberty, New York, NY'
};