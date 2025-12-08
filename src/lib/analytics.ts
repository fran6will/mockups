// GA4 Custom Event Tracking Utility
// Uses the gtag function loaded by @next/third-parties/google

type GtagEvent = {
    action: string;
    category: string;
    label?: string;
    value?: number;
};

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export function trackEvent({ action, category, label, value }: GtagEvent) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
}

// Pre-defined events for consistency
export const Analytics = {
    // Generation events
    generateMockup: (productSlug: string, size: string) => {
        trackEvent({
            action: 'generate_mockup',
            category: 'engagement',
            label: productSlug,
            value: size === '4K' ? 15 : size === '2K' ? 10 : 5,
        });
    },

    // Product interaction
    clickProduct: (productSlug: string, location: string) => {
        trackEvent({
            action: 'click_product',
            category: 'engagement',
            label: `${productSlug} - ${location}`,
        });
    },

    // CTA clicks
    clickTryItFree: (location: string) => {
        trackEvent({
            action: 'click_try_free',
            category: 'cta',
            label: location,
        });
    },

    clickStartTrial: (location: string) => {
        trackEvent({
            action: 'click_start_trial',
            category: 'cta',
            label: location,
        });
    },

    // Auth events
    clickSignUp: (location: string) => {
        trackEvent({
            action: 'click_signup',
            category: 'auth',
            label: location,
        });
    },

    clickLogin: (location: string) => {
        trackEvent({
            action: 'click_login',
            category: 'auth',
            label: location,
        });
    },

    // Upload events
    uploadLogo: (productSlug: string) => {
        trackEvent({
            action: 'upload_logo',
            category: 'engagement',
            label: productSlug,
        });
    },

    // Download
    downloadMockup: (productSlug: string) => {
        trackEvent({
            action: 'download_mockup',
            category: 'conversion',
            label: productSlug,
        });
    },

    // Pricing
    viewPricing: () => {
        trackEvent({
            action: 'view_pricing',
            category: 'funnel',
        });
    },

    selectPlan: (planName: string) => {
        trackEvent({
            action: 'select_plan',
            category: 'funnel',
            label: planName,
        });
    },
};
