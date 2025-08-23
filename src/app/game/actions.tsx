'use server'
import { supabase } from "@/lib/supabase";
import { CaptureResult } from "@/types/type";
import { v4 as uuidv4 } from 'uuid';

export async function uploadImageToStorage(
    captureResult: CaptureResult
) {
    if (!captureResult.url) {
        throw new Error("No image URL provided in captureResult");
    }

    if (!captureResult.metadata) {
        throw new Error("No metadata provided in captureResult");
    }

    // Extract base64 data from the URL (e.g., data:image/jpeg;base64,...)
    const base64String = captureResult.url.split(',')[1];
    if (!base64String) {
        throw new Error("Invalid base64 URL format");
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Determine content type from mimeType or infer from URL, default to JPEG
    const contentType = captureResult.metadata.mimeType || captureResult.url.split(';')[0].split(':')[1] || 'image/jpeg';

    // Generate unique filename using UUID and sanitized capturedAt timestamp
    const timestamp = captureResult.metadata.capturedAt.replace(/[:.]/g, '-');
    const uniqueId = uuidv4().split('-')[0]; // Use first 8 characters of UUID for brevity
    const fileExtension = 'jpg';
    const path = `${timestamp}_${uniqueId}.${fileExtension}`; // Flat structure, directly under bucket

    // Create File object for Supabase upload
    const file = new File([buffer], path, { type: contentType });

    const { data, error } = await supabase.storage
        .from('Screenshots')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType,
            metadata: captureResult.metadata
        });

    if (error) {
        throw error;
    }

    return {
        data,
        metadata: captureResult.metadata
    };
}