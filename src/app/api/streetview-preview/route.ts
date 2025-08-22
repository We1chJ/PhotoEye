'use server'
// File: app/api/streetview-preview/route.ts (Next.js App Router)
// This is SERVER-SIDE code that handles the secure proxy

export async function POST(request: Request) {
  try {
    const { lat, lng, heading, pitch, zoom } = await request.json();

    // Validate inputs
    if (!lat || !lng || heading === undefined || pitch === undefined || zoom === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Calculate FOV from zoom
    const fov = calculateFOVFromZoom(zoom);
    
    // Build Street View API URL with your server-side API key
    const params = new URLSearchParams({
      size: '640x640',
      location: `${lat},${lng}`,
      heading: Math.round(heading).toString(),
      pitch: Math.round(pitch).toString(),
      fov: Math.round(fov).toString(),
      format: 'jpg',
      key: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY! // Server-side environment variable
    });

    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
    
    // Fetch the image from Google (happens on server)
    const response = await fetch(streetViewUrl);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Street View image' }), 
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image directly (no API key visible anywhere)
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*', // If needed for CORS
      },
    });
    
  } catch (error) {
    console.error('Street View proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function calculateFOVFromZoom(zoom: number): number {
  const clampedZoom = Math.max(0, Math.min(zoom, 4));
  const fov = 120 / Math.pow(2, clampedZoom);
  return Math.max(10, Math.min(120, fov));
}
