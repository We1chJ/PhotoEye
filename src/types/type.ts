export interface CaptureOptions {
    size?: string;
    format?: 'jpg' | 'png';
    quality?: number;
}

export interface CaptureResult {
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

export type Photo = {
  id: number;           // int8 (bigint in PostgreSQL maps to number in TypeScript)
  created_at: string;   // timestamp as ISO string
  uid: string;          // uuid - foreign key reference to auth.users.id
  image: string;        // text - image URL or path
}