---
description: How to connect your GoDaddy domain (copiecolle.ai) to Vercel
---

# Connect `copiecolle.ai` to Vercel

Since your project is built with Next.js and likely hosted on Vercel, here is how to connect your new domain.

## 1. Add Domain in Vercel
1.  Go to your **Vercel Dashboard**.
2.  Select your project (`mockups` or similar).
3.  Go to **Settings** > **Domains**.
4.  Enter `copiecolle.ai` and click **Add**.
5.  Select the recommended option (usually "Add copiecolle.ai" and redirect "www.copiecolle.ai" to it, or vice versa).

## 2. Configure DNS in GoDaddy
Vercel will show you a set of DNS records (A Record and CNAME) or Nameservers. The recommended method is usually **A Record** and **CNAME**.

1.  Log in to **GoDaddy**.
2.  Go to **My Products** > **Domains**.
3.  Find `copiecolle.ai` and click **DNS**.
4.  **Delete** any existing "Parked" records if present.
5.  Add the records provided by Vercel:

    **Type A (Root Domain):**
    -   **Type**: `A`
    -   **Name**: `@`
    -   **Value**: `76.76.21.21` (Vercel's IP - *Verify this in your Vercel dashboard*)
    -   **TTL**: `1 Hour` (or default)

    **Type CNAME (Subdomain):**
    -   **Type**: `CNAME`
    -   **Name**: `www`
    -   **Value**: `cname.vercel-dns.com`
    -   **TTL**: `1 Hour`

## 3. Verify
1.  Go back to Vercel.
2.  It might take a few minutes (up to 24h, but usually fast) for the configuration to propagate.
3.  Once the icons turn **Green**, your site is live at `https://copiecolle.ai`!

## 4. Update Environment Variables (Important!)
Don't forget to update your production environment variables if they rely on the domain:
-   **Lemon Squeezy**: Update your store settings to point to the new domain.
-   **Google OAuth**: Add `https://copiecolle.ai` and `https://copiecolle.ai/auth/callback` to your **Authorized Origins** and **Redirect URIs** in Google Cloud Console.
-   **Supabase**: Add `https://copiecolle.ai` to your **Site URL** and **Redirect URLs** in Authentication > URL Configuration.
