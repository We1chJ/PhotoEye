import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY || '',
  version: 'weekly',
  libraries: ['places'],
});

// Generates a random Street View location
function generateLatLong(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const lat = Math.random() * 180 - 90;
    const lng = Math.random() * 360 - 180;

    loader.importLibrary('streetView').then(() => {
      const streetService = new google.maps.StreetViewService();
      streetService.getPanorama(
        {
          location: { lat, lng },
          preference: google.maps.StreetViewPreference.BEST,
          radius: 50000,
          sources: [google.maps.StreetViewSource.OUTDOOR],
        },
        (data, status) => {
          if (status === 'OK' && data) {
            const latO = (data.location.latLng as google.maps.LatLng).lat();
            const lngO = (data.location.latLng as google.maps.LatLng).lng();
            console.log(
              `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latO},${lngO}`
            );
            resolve({ lat: latO, lng: lngO });
          } else {
            console.log('Invalid lat and long, retrying...');
            resolve(null);
          }
        }
      );
    });
  });
}

// Reverse geocode coordinates to get place name
async function getPlaceName(lat: number, lng: number): Promise<string> {
  return new Promise((resolve) => {
    loader.importLibrary('geocoding').then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            // Try to get the most specific place name
            const result = results[0];
            
            // Look for city, locality, or administrative area
            const addressComponents = result.address_components;
            let placeName = '';
            
            // Priority order: locality (city) > administrative_area_level_1 (state/province) > country
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
            
            // If we found a good component, add country for context (unless it's already the country)
            if (placeName && !priorities.includes('country')) {
              const countryComponent = addressComponents.find(comp => 
                comp.types.includes('country')
              );
              if (countryComponent && countryComponent.long_name !== placeName) {
                placeName += `, ${countryComponent.long_name}`;
              }
            }
            
            resolve(placeName || 'Unknown Place');
          } else {
            console.log('Geocoding failed:', status);
            resolve('Unknown Place');
          }
        }
      );
    }).catch(() => {
      resolve('Unknown Place');
    });
  });
}

export async function generateRandomLocation(): Promise<{ 
  name: string; 
  lat: number; 
  lng: number; 
}> {
  let found = false;
  let output: { lat: number; lng: number } | null = null;

  console.log('Finding random location...');
  while (!found) {
    const data = await generateLatLong();
    if (data) {
      output = data;
      found = true;
    }
  }

  if (!output) {
    return {
      name: 'Unknown Place',
      lat: 0,
      lng: 0,
    };
  }

  // Get the place name using reverse geocoding
  const placeName = await getPlaceName(output.lat, output.lng);

  return {
    name: placeName,
    lat: output.lat,
    lng: output.lng,
  };
}