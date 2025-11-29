# Copié-Collé System Knowledge Base

## 1. Project Overview
**Copié-Collé** is an AI-powered mockup generator that allows users to realistically place logos and designs onto product photos (t-shirts, mugs, etc.) using Google's Gemini AI. It bridges the gap between static digital downloads and interactive product visualization.

### Core Value Proposition
- **"No Photoshop Needed"**: Users upload a logo, and the AI handles the lighting, warping, and texture.
- **Hybrid Monetization**: 
    - **Free Tryout**: Guests can generate mockups on specific "free" products.
    - **Credit System**: Pay-per-use for casual users.
    - **Pro Membership**: Unlimited generations for power users ($9.99/mo).

---

## 2. Technical Architecture

### Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Glassmorphism Design System)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth + Email/Password)
- **Storage**: Supabase Storage (Buckets: `mockup-bases`, `generated-mockups`)
- **AI Model**: Google Gemini 1.5 Pro / Gemini 3 Pro (Experimental Image Preview)
- **Payments**: Lemon Squeezy (Webhooks for subscription management)

### Key Directories
- `src/app`: Next.js App Router pages and API routes.
- `src/components/customer`: Core interactive components (`ImageCompositor`, `ProductClient`).
- `src/components/landing`: Marketing landing page components.
- `src/lib/vertex`: AI client configuration (`client.ts`).
- `src/hooks`: Custom React hooks (`use-access.ts`).
- `supabase/migrations`: Database schema changes.

---

## 3. Core Features & Workflows

### A. Mockup Generation Pipeline
1.  **Input**: User uploads a logo (PNG/JPG) in `ImageCompositor`.
2.  **Composition**: `FabricCanvas` (Fabric.js) allows positioning, scaling, and rotation.
3.  **Processing**: 
    - Client composites layers into a single base64 image.
    - Sends request to `/api/generate`.
4.  **AI Generation**:
    - Calls `gemini-3-pro-image-preview`.
    - Prompt: "Generate a photorealistic product shot... Keep the provided design/logo unchanged..."
    - Returns a high-res image URL.
5.  **Storage**: Result is uploaded to `generated-mockups` bucket.
6.  **Cost**: Deducts credits (2 for 1K, 4 for 2K, 6 for 4K) unless user is Pro or product is Free.

### B. Custom Mockups (Admin/User)
- **Admin**: Uploads high-res base images via `/admin`. AI auto-fills details (title, tags) using `analyzeMockupImage`.
- **User**: Can upload their own base images (feature in progress/beta).
- **Data Model**: Stored in `products` table with `status` ('pending', 'approved') and `created_by` field.

### C. Authentication & Access Control
- **Guests**: Can view "Free" products. "Generate" button prompts sign-in.
- **Free Users**: Get 5 free credits on sign-up (handled in `/auth/callback`).
- **Pro Users**: Detected via `subscriptions` table (synced from Lemon Squeezy). Unlimited access.
- **Hook**: `useAccess(slug)` determines if a user is `guest`, `pro`, or `none`.

---

## 4. Database Schema (Key Tables)

### `products`
- `id`: UUID
- `slug`: Unique URL identifier
- `base_image_url`: Source image
- `custom_prompt`: AI instructions
- `is_free`: Boolean (for Tryout section)
- `status`: 'pending' | 'approved' (for user submissions)

### `user_credits`
- `user_id`: Link to Auth User
- `balance`: Current credit balance
- `total_used`: Lifetime usage stats

### `generations`
- `product_id`: What was generated
- `status`: 'success' | 'error'
- `image_url`: Result
- `meta`: JSON (aspect ratio, user email)

### `subscriptions`
- `user_id`: Link to Auth User
- `status`: 'active', 'cancelled', 'past_due'
- `variant_id`: Lemon Squeezy Product ID (Pro vs Agency)
- `ends_at`: Expiration date

---

## 5. AI Configuration (`src/lib/vertex/client.ts`)
- **Model**: `gemini-3-pro-image-preview`
- **Capabilities**: Multimodal (Text + Image Input -> Image Output).
- **Prompt Engineering**: Critical "negative prompt" logic ensures the logo isn't hallucinated or changed.
- **Video**: Experimental `generateScene` function for animating static mockups.

---

## 6. Operational Notes
- **Black Friday**: Global discount code `BF2025` (50% off).
- **SEO**: Dynamic sitemap (`sitemap.ts`) auto-indexes all public products.
- **Analytics**: Vercel Analytics + Custom `generations` logging.
