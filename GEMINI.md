# Project Gemini: Nano Banana Pro Engine

## Overview
This project is a Next.js application designed to generate realistic product mockups using Google's Gemini AI (specifically the "Nano Banana Pro Engine"). It features a dual-interface system: an admin panel for creating product templates and a customer-facing view for generating custom mockups by uploading logos.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL, Storage)
- **AI Model:** Google Generative AI (Gemini) via `@google/generative-ai` SDK
- **Icons:** Lucide React

## Architecture & Key Components

### 1. Database (Supabase)
The database schema (`supabase/schema.sql`) consists of two main tables:
- **`products`**: Stores product templates.
  - `id`: UUID
  - `title`: Product name (e.g., "Vintage Cap")
  - `slug`: Unique URL identifier (e.g., "vintage-cap")
  - `password_hash`: Password for accessing the product page (Note: Currently handled insecurely on the client-side in some contexts).
  - `base_image_url`: URL to the high-quality base image in Supabase Storage.
  - `overlay_config`: JSONB field for storing AI prompt hints or coordinates.
- **`downloads`**: Tracks download events (product ID, timestamp).

**Storage:** A public bucket named `mockup-bases` is used to store the base product images.

### 2. Admin Interface (`src/app/admin/page.tsx`)
- Allows authenticated admins to create new product templates.
- Features:
  - Form inputs for Title, Slug, and Access Password.
  - File upload for the Base Image.
  - Uses a Server Action (`createProduct` in `src/app/actions.ts`) to securely insert data into the database, bypassing Row Level Security (RLS) where necessary for admin operations.

### 3. Customer Interface (`src/app/[slug]/page.tsx`)
- The main entry point for end-users.
- Dynamic route based on the product `slug`.
- **Flow:**
  1. User visits `/[slug]`.
  2. Application fetches product details from Supabase.
  3. User is prompted for a password (client-side validation - **Needs Improvement**).
  4. Upon access, the `ImageCompositor` component is rendered.

### 4. Image Compositor (`src/components/customer/ImageCompositor.tsx`)
- A comprehensive React component handling the user interaction.
- **Features:**
  - Logo upload via drag-and-drop or file selection.
  - Client-side preview.
  - "Generate Mockup" button that triggers the backend API.
  - Displays the AI-generated result.

### 5. AI Generation API (`src/app/api/generate/route.ts` & `src/lib/vertex/client.ts`)
- **Route:** `/api/generate` (POST)
- **Process:**
  1. Receives the uploaded logo and product details.
  2. Calls `generateMockup` in `src/lib/vertex/client.ts`.
  3. The client interacts with the Google Generative AI model.
  4. It constructs a prompt instructing the model to realistically overlay the user's logo onto the specific base product image.
  5. Returns the generated image data to the frontend.

## Security Notes
- **Password Protection:** The current implementation involves fetching the password hash to the client for validation in `src/app/[slug]/page.tsx`, which is insecure. This should be moved to a server-side verification step.
- **RLS Policies:** Row Level Security is enabled on the `products` table, with policies for public read access (currently too permissive for sensitive fields like `password_hash`) and admin-only write access.

## Development Setup
1.  Install dependencies: `npm install`
2.  Configure environment variables for Supabase and Google AI.
3.  Run development server: `npm run dev`
