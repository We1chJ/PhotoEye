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