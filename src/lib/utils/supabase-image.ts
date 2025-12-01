export const getOptimizedSupabaseUrl = (url: string, width: number = 1200, quality: number = 80) => {
    if (!url || !url.includes('supabase.co')) return url;

    // Check if it already has query params
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}&resize=contain`;
};
