# Project Gemini: Nano Banana Pro Engine (Glassmorphism Edition)

## Overview
**CopiéCollé (Nano Banana Pro)** is a high-performance, AI-powered mockup generator designed to bridge the gap between static Etsy digital downloads and interactive product visualization. It utilizes Google's Gemini AI (Vertex AI) to realistically composite user-uploaded logos onto high-quality product photography.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Custom Glassmorphism Theme)
- **Database & Auth:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (Public Buckets)
- **AI Model:** Google Gemini 1.5 Pro / 2.0 (via Google Generative AI SDK)
- **Icons:** Lucide React

## Design System
The application follows a strict **Glassmorphism** aesthetic:
- **Palette:**
  - Base Cream: `#F2F0E9`
  - Deep Teal: `#2A7F7F`
  - Ink Black: `#1A1A1A`
- **UI Elements:** Frosted glass cards (`backdrop-blur`), floating inputs, and teal gradients.
- **UX:** Animated loading states with transparency to keep context; client-side image compression for instant uploads.

## Core Architecture

### 1. Database Schema (Supabase)
- **`products`**: Stores mockup templates.
  - `id`: UUID
  - `slug`: Unique URL (e.g., `vintage-tee`)
  - `password_hash`: Simple access control for Etsy buyers.
  - `base_image_url`: High-res blank product image.
  - `custom_prompt`: Specific instructions for the AI (e.g., "Maintain fabric ripples").
  - `is_pro_included`: Boolean indicating if this product is part of the pro subscription (defaults to true).
- **`generations`**: Tracks usage analytics.
  - `product_id`: Link to product.
  - `status`: 'success' or 'error'.
  - `duration_ms`: Performance metric.
  - `meta`: Stores aspect ratio choices.

### 2. User Flows

#### A. The Admin (Creator)
- Accessed via `/admin`.
- Uploads a raw high-res photo (4K).
- Defines the "magic prompt" to guide the AI on where to place the logo.
- Sets a password (distributed via Etsy receipt).

#### B. The Customer (Etsy Buyer)
- **Entry:** Hits `/[slug]` (e.g., `/heavy-hoodie`).
- **Gate:** Enters the password provided in their Etsy purchase.
- **Onboarding:** Sees a "Welcome" glass card explaining the "No Photoshop needed" benefit.
- **Interaction:**
  1. Uploads logo (auto-compressed client-side to <1.5MB to avoid timeouts).
  2. Selects Aspect Ratio (Square, Wide, Story).
  3. Clicks "Generate".
- **Result:** AI returns a photorealistic composite. The user can download the high-res result.

### 3. AI Pipeline (`src/lib/vertex/client.ts`)
1.  **Input:** Base Image URL + User Logo (Base64).
2.  **Processing:** Client-side canvas resizes logo to max 1536px (JPEG 85%).
3.  **Prompting:** Constructs a prompt combining the product's `custom_prompt` with strict instructions to preserve logo colors/text.
4.  **Generation:** Calls Gemini with `responseModalities: ["image"]`.
5.  **Output:** Returns Base64 image data to frontend.

## Operational Features
- **Usage Tracking:** Every generation is logged to Supabase for analytics (monitoring costs and popular items).
- **Error Handling:** Graceful fallbacks for AI timeouts or "content safety" blocks.
- **Performance:** Optimized for Vercel Serverless functions (strict 10s/60s timeout management via client-side compression).

## Development Commands
- `npm run dev`: Start local server.
- `npm run build`: Check build validity (TypeScript strict mode).
- `git push`: Triggers Vercel deployment.