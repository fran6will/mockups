import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeMockupImage, generateScene } from './client';

const apiKey = process.env.GEMINI_API_KEY;

// We use the text-capable model for the planning phase
const planningModelId = 'gemini-3-pro-preview';

export interface BatchPlan {
    productAnalysis: any;
    styleAnalysis: any;
    prompts: string[];
}

export const analyzeAndPlanBatch = async (
    blankProductUrl: string,
    styleImageUrl: string,
    mode: 'coherent' | 'diverse' = 'coherent'
): Promise<BatchPlan> => {
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }

    console.log(`Starting Batch Analysis & Planning (Mode: ${mode})...`);

    // 1. Analyze both images in parallel
    const [productAnalysis, styleAnalysis] = await Promise.all([
        analyzeMockupImage(blankProductUrl, 'mockup'),
        analyzeMockupImage(styleImageUrl, 'scene')
    ]);

    console.log("Analysis complete. Generatng prompts...");

    // 2. Generate 5 unique prompts combining them
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: planningModelId });

    let modeInstruction = "";
    if (mode === 'coherent') {
        modeInstruction = `
            2. All must adhere STRICTLY to the "Target Style" (lighting, colors, mood).
            3. They should look like a cohesive collection from the same photoshoot.
        `;
    } else {
        modeInstruction = `
            2. DIVERGE from the reference style while keeping the vibe.
            3. Create widely DIFFERENT settings (e.g., indoors vs outdoors, minimal vs busy, table vs hanging).
            4. Be creative! This is a "Diversity Mode" to explore different looks.
        `;
    }

    const systemPrompt = `
        You are an expert creative director for product photography.
        
        Product Description: "${productAnalysis.description}"
        Target Style/Vibe: "${styleAnalysis.description}"
        
        Task: Create 5 distinct, photorealistic prompts to feature this product in this style.
        
        Requirements:
        1. Each prompt must describe a different scene or angle.
        ${modeInstruction}
        5. Keep prompts concise (under 40 words) but descriptive.
        6. Return ONLY a JSON array of strings. Example: ["Prompt 1...", "Prompt 2..."]
        7. Do not include markdown formatting.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let prompts: string[] = [];
    try {
        prompts = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse prompts JSON:", text);
        // Fallback if JSON fails
        prompts = text.split('\n').filter(line => line.length > 10).slice(0, 5);
    }

    return {
        productAnalysis,
        styleAnalysis,
        prompts
    };
};

export const executeBatchItem = async (
    blankProductUrl: string,
    styleImageUrl: string,
    prompt: string
) => {
    // Re-use the existing powerful Scene Generation logic
    // This uses 'gemini-3-pro-image-preview' internally in client.ts
    // We pass the styleImageUrl as a style reference
    return await generateScene(
        blankProductUrl,
        prompt,
        [styleImageUrl], // Pass style image as reference
        '1:1', // Default square for now
        '1K'   // Default high res
    );
};
