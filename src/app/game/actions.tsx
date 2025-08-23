'use server'
import { supabase } from "@/lib/supabase";
import { CaptureResult } from "@/types/type";
import { v4 as uuidv4 } from 'uuid';

export async function uploadImageToStorage(
    captureResult: CaptureResult
): Promise<{ success: boolean; message: string }> {
    if (!captureResult.url) {
        return { success: false, message: "No image URL provided in captureResult" };
    }

    if (!captureResult.metadata) {
        return { success: false, message: "No metadata provided in captureResult" };
    }

    const base64String = captureResult.url.split(',')[1];
    if (!base64String) {
        return { success: false, message: "Invalid base64 URL format" };
    }

    const buffer = Buffer.from(base64String, 'base64');
    const contentType = captureResult.metadata.mimeType || captureResult.url.split(';')[0].split(':')[1] || 'image/jpeg';
    const timestamp = captureResult.metadata.capturedAt.replace(/[:.]/g, '-');
    const uniqueId = uuidv4().split('-')[0];
    const fileExtension = 'jpg';
    const path = `${timestamp}_${uniqueId}.${fileExtension}`;

    const file = new File([buffer], path, { type: contentType });

    const { error } = await supabase.storage
        .from('Screenshots')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType,
            metadata: captureResult.metadata
        });

    if (error) {
        return { success: false, message: error.message || "Upload failed" };
    }

    return { success: true, message: "Upload successful!" };
}
