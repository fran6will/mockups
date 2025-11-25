import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY for video generation.");
}

const client = new GoogleGenAI({ apiKey });

export const generateVideo = async (
    prompt: string,
    imageUrl: string,
    mimeType: string = "image/png"
) => {
    try {
        // Fetch image and convert to bytes
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const imageBytes = Buffer.from(arrayBuffer).toString('base64');

        // Start video generation
        const operation = await client.models.generateVideos({
            model: "veo-3.1-fast-generate-preview",
            prompt: prompt,
            image: {
                imageBytes: imageBytes,
                mimeType: mimeType,
            },
        });

        return {
            success: true,
            operationName: operation.name
        };
    } catch (error: any) {
        console.error("Veo API Error (Start):", error);
        return {
            success: false,
            error: error.message || "Failed to start video generation"
        };
    }
};

export const checkVideoStatus = async (operationName: string) => {
    try {
        // Use REST API directly to avoid SDK stateful object requirement
        const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText);
        }

        if (data.done) {
            if (data.error) {
                return { status: 'error', error: data.error.message };
            }

            // The REST API response structure for Veo:
            // { done: true, response: { generateVideoResponse: { generatedSamples: [ { video: { uri: "..." } } ] } } }
            const video = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video;

            if (!video?.uri) {
                return { status: 'error', error: "No video URI returned" };
            }

            // Append API key to the video URI to allow frontend access
            const videoUriWithKey = `${video.uri}&key=${apiKey}`;

            return {
                status: 'done',
                videoUri: videoUriWithKey
            };
        }

        return { status: 'processing' };
    } catch (error: any) {
        console.error("Veo API Error (Check):", error);
        return { status: 'error', error: error.message };
    }
};
