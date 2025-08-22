'use server'
import { supabase } from "@/lib/supabase";

export async function uploadImageToStorage(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw error;
    }
    return data;
}