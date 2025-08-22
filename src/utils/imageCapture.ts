/**
 * Securely captures the exact Street View image from the current panorama view and angle
 * Uses server-side proxy to protect API key
 */
export async function captureCurrentView(
  panorama: google.maps.StreetViewPanorama
): Promise<string | null> {
  try {
    const position = panorama.getPosition();
    const pov = panorama.getPov();

    if (!position) {
      console.error('❌ Missing position for image capture');
      return null;
    }

    // Get the current zoom level and convert to FOV
    const zoom = panorama.getZoom();
    const fov = calculateFOVFromZoom(zoom);

    console.log('📸 Capturing Street View image...');
    console.log('🔍 Zoom level:', zoom, 'FOV:', fov);
    console.log('📍 Position:', position.lat(), position.lng());
    console.log('👁️ View:', Math.round(pov.heading || 0), 'heading,', Math.round(pov.pitch || 0), 'pitch');

    // Call your secure server endpoint (NO API KEY NEEDED HERE!)
    const response = await fetch('/api/streetview-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: position.lat(),
        lng: position.lng(),
        heading: Math.round(pov.heading || 0),
        pitch: Math.round(pov.pitch || 0),
        zoom: zoom
      })
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch image from server:', response.status);
      
      // Try to get error details if available
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Server error:', errorData.error);
      }
      
      return null;
    }

    // Convert response to blob and create secure object URL
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log('✅ Secure Street View image URL created:', imageUrl);
    console.log('🔒 Image size:', blob.size, 'bytes');
    console.log('🛡️ No API key exposed - completely secure!');
    
    // This URL will look like: blob:http://localhost:3000/12345-abcd-...
    // No API key visible anywhere!
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

/**
 * Enhanced version with better error handling and options
 */
export async function captureCurrentViewWithOptions(
  panorama: google.maps.StreetViewPanorama,
  options: {
    size?: string;
    format?: 'jpg' | 'png';
    quality?: number;
  } = {}
): Promise<{ url: string | null; error?: string; metadata?: any }> {
  try {
    const position = panorama.getPosition();
    const pov = panorama.getPov();

    if (!position) {
      return { 
        url: null, 
        error: 'Missing panorama position' 
      };
    }

    const zoom = panorama.getZoom();
    const fov = calculateFOVFromZoom(zoom);

    // Capture metadata
    const metadata = {
      lat: position.lat(),
      lng: position.lng(),
      heading: Math.round(pov.heading || 0),
      pitch: Math.round(pov.pitch || 0),
      zoom: zoom,
      fov: Math.round(fov),
      capturedAt: new Date().toISOString()
    };

    console.log('📸 Capturing with metadata:', metadata);

    const response = await fetch('/api/streetview-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metadata,
        // Pass options to server if needed
        size: options.size || '640x640',
        format: options.format || 'jpg'
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Server error: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Fallback if JSON parsing fails
        }
      }
      
      return { 
        url: null, 
        error: errorMessage,
        metadata 
      };
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log('✅ Secure capture successful:', {
      url: imageUrl,
      size: blob.size,
      type: blob.type,
      metadata
    });
    
    return { 
      url: imageUrl, 
      metadata: {
        ...metadata,
        fileSize: blob.size,
        mimeType: blob.type
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Capture failed:', errorMessage);
    
    return { 
      url: null, 
      error: errorMessage 
    };
  }
}

/**
 * Memory management helper - call this to clean up blob URLs
 */
export function cleanupImageUrl(imageUrl: string | null) {
  if (imageUrl && imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl);
    console.log('🧹 Cleaned up blob URL:', imageUrl);
  }
}