'use server'

/**
* Server-side Street View image capture with secure API key handling
* Combined client capture logic with server-side Google API calls
*/

interface CaptureOptions {
 size?: string;
 format?: 'jpg' | 'png';
 quality?: number;
}

interface CaptureResult {
 url: string | null;
 error?: string;
 metadata?: {
   lat: number;
   lng: number;
   heading: number;
   pitch: number;
   zoom: number;
   fov: number;
   capturedAt: string;
   fileSize?: number;
   mimeType?: string;
 };
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
* Server-side function to capture Street View image directly
* No API routes needed - pure server action
*/
export async function captureCurrentView(
 lat: number,
 lng: number,
 heading: number,
 pitch: number,
 zoom: number,
 options: CaptureOptions = {}
): Promise<string | null> {
 try {
   // Validate inputs
   if (!lat || !lng || heading === undefined || pitch === undefined || zoom === undefined) {
     console.error('❌ Missing required parameters for image capture');
     return null;
   }

   // Get the current zoom level and convert to FOV
   const fov = calculateFOVFromZoom(zoom);

   console.log('📸 Capturing Street View image...');
   console.log('🔍 Zoom level:', zoom, 'FOV:', fov);
   console.log('📍 Position:', lat, lng);
   console.log('👁️ View:', Math.round(heading), 'heading,', Math.round(pitch), 'pitch');

   // Build Street View API URL with server-side API key
   const params = new URLSearchParams({
     size: options.size || '640x640',
     location: `${lat},${lng}`,
     heading: Math.round(heading).toString(),
     pitch: Math.round(pitch).toString(),
     fov: Math.round(fov).toString(),
     format: options.format || 'jpg',
     key: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY! // Server-side environment variable
   });

   const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

   // Fetch the image from Google (happens on server)
   const response = await fetch(streetViewUrl);

   if (!response.ok) {
     console.error('❌ Failed to fetch Street View image:', response.status);
     return null;
   }

   // Get the image as array buffer
   const imageBuffer = await response.arrayBuffer();
   
   // Convert to base64 data URL for client use
   const base64 = Buffer.from(imageBuffer).toString('base64');
   const mimeType = response.headers.get('content-type') || 'image/jpeg';
   const dataUrl = `data:${mimeType};base64,${base64}`;
   
   console.log('✅ Street View image captured successfully');
   console.log('🔒 Image size:', imageBuffer.byteLength, 'bytes');
   console.log('🛡️ API key secure on server');
   
   return dataUrl;

 } catch (error) {
   console.error('❌ Failed to capture Street View image:', error);
   return null;
 }
}

/**
* Enhanced version with better error handling and metadata
*/
export async function captureCurrentViewWithOptions(
 lat: number,
 lng: number,
 heading: number,
 pitch: number,
 zoom: number,
 options: CaptureOptions = {}
): Promise<CaptureResult> {
 try {
   // Validate inputs
   if (!lat || !lng || heading === undefined || pitch === undefined || zoom === undefined) {
     return {
       url: null,
       error: 'Missing required parameters'
     };
   }

   const fov = calculateFOVFromZoom(zoom);

   // Capture metadata
   const metadata = {
     lat,
     lng,
     heading: Math.round(heading),
     pitch: Math.round(pitch),
     zoom,
     fov: Math.round(fov),
     capturedAt: new Date().toISOString()
   };

   console.log('📸 Capturing with metadata:', metadata);

   // Build Street View API URL
   const params = new URLSearchParams({
     size: options.size || '640x640',
     location: `${lat},${lng}`,
     heading: Math.round(heading).toString(),
     pitch: Math.round(pitch).toString(),
     fov: Math.round(fov).toString(),
     format: options.format || 'jpg',
     key: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!
   });

   const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

   // Fetch from Google Street View API
   const response = await fetch(streetViewUrl);

   if (!response.ok) {
     return {
       url: null,
       error: `Google API error: ${response.status}`,
       metadata
     };
   }

   // Get image data
   const imageBuffer = await response.arrayBuffer();
   const mimeType = response.headers.get('content-type') || 'image/jpeg';
   
   // Convert to data URL
   const base64 = Buffer.from(imageBuffer).toString('base64');
   const dataUrl = `data:${mimeType};base64,${base64}`;

   console.log('✅ Secure capture successful');

   return {
     url: dataUrl,
     metadata: {
       ...metadata,
       fileSize: imageBuffer.byteLength,
       mimeType
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
* Server-side function to capture and immediately upload to storage
* Combines capture + upload in one server action
*/
export async function captureAndUploadView(
 lat: number,
 lng: number,
 heading: number,
 pitch: number,
 zoom: number,
 uploadFunction: (file: File, bucket: string, path: string) => Promise<any>,
 bucket: string = 'streetview-images',
 options: CaptureOptions = {}
): Promise<{ success: boolean; url?: string; error?: string; metadata?: any }> {
 try {
   // First capture the image
   const result = await captureCurrentViewWithOptions(lat, lng, heading, pitch, zoom, options);
   
   if (!result.url || result.error) {
     return {
       success: false,
       error: result.error || 'Failed to capture image'
     };
   }

   // Convert data URL back to blob/file for upload
   const response = await fetch(result.url);
   const blob = await response.blob();
   
   // Create file object
   const timestamp = Date.now();
   const fileName = `streetview-${timestamp}-${lat.toFixed(6)}-${lng.toFixed(6)}.jpg`;
   const file = new File([blob], fileName, { type: blob.type });
   
   // Generate upload path
   const filePath = `captures/${fileName}`;
   
   // Upload using provided upload function
   const uploadResult = await uploadFunction(file, bucket, filePath);
   
   return {
     success: true,
     url: uploadResult.path,
     metadata: {
       ...result.metadata,
       uploadPath: filePath,
       fileName
     }
   };

 } catch (error) {
   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
   console.error('❌ Capture and upload failed:', errorMessage);
   
   return {
     success: false,
     error: errorMessage
   };
 }
}