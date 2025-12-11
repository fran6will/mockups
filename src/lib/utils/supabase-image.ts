export const getOptimizedSupabaseUrl = (url: string, width: number = 800, quality: number = 75) => {
    if (!url) return url;

    // If not a Supabase URL, return as-is
    if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

    // Supabase Image Transformation API
    // Format: /storage/v1/render/image/public/{bucket}/{path}?width=X&quality=Y&resize=contain
    // resize=contain preserves aspect ratio without cropping
    try {
        const transformUrl = url.replace(
            '/storage/v1/object/public/',
            '/storage/v1/render/image/public/'
        );
        return `${transformUrl}?width=${width}&quality=${quality}&resize=contain`;
    } catch {
        return url;
    }
};

