/**
 * Captures the exact Street View image from the current panorama view and angle
 */
export function captureCurrentView(
  apiKey: string,
  panorama: google.maps.StreetViewPanorama
): string | null {
  try {
    const position = panorama.getPosition();
    const pov = panorama.getPov();

    if (!position || !apiKey) {
      console.error('❌ Missing position or API key for image capture');
      return null;
    }

    const params = new URLSearchParams({
      size: '640x640',
      location: `${position.lat()},${position.lng()}`,
      heading: Math.round(pov.heading || 0).toString(),
      pitch: Math.round(pov.pitch || 0).toString(),
      fov: '90',
      format: 'jpg',
      key: apiKey
    });

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
    
    console.log('📸 Captured Street View image URL:', imageUrl);
    return imageUrl;

  } catch (error) {
    console.error('❌ Failed to capture Street View image:', error);
    return null;
  }
}