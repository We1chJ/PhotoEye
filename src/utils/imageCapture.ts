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

    // Get the current zoom level and convert to FOV
    const zoom = panorama.getZoom();
    const fov = calculateFOVFromZoom(zoom);

    const params = new URLSearchParams({
      size: '640x640',
      location: `${position.lat()},${position.lng()}`,
      heading: Math.round(pov.heading || 0).toString(),
      pitch: Math.round(pov.pitch || 0).toString(),
      fov: Math.round(fov).toString(), // Dynamic FOV based on zoom
      format: 'jpg',
      key: apiKey
    });

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
    
    console.log('📸 Captured Street View image URL:', imageUrl);
    console.log('🔍 Zoom level:', zoom, 'FOV:', fov);
    return imageUrl;

  } catch (error) {
    console.error('❌ Failed to capture Street View image:', error);
    return null;
  }
}

/**
 * Convert Google Maps Street View zoom level to FOV (Field of View)
 * Google Street View zoom ranges from 0 (zoomed out) to 4+ (zoomed in)
 * FOV ranges from 10° (zoomed in) to 120° (zoomed out)
 */
function calculateFOVFromZoom(zoom: number): number {
  // Google's Street View zoom to FOV conversion
  // Zoom 0 = ~120° FOV, Zoom 1 = ~90° FOV, Zoom 2 = ~60° FOV, etc.
  
  // Clamp zoom between reasonable values
  const clampedZoom = Math.max(0, Math.min(zoom, 4));
  
  // Convert zoom to FOV using exponential decay
  // This approximates Google's internal conversion
  const fov = 120 / Math.pow(2, clampedZoom);
  
  // Clamp FOV to API limits (10-120 degrees)
  return Math.max(10, Math.min(120, fov));
}