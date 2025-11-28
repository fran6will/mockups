import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Header />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-lg text-ink/80">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        At CopiéCollé, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your email address, name, and payment information (processed securely by our payment providers).
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.
                    </p>

                    <h3>3. Cookies</h3>
                    <p>
                        We use cookies to enhance your experience on our site. You can control cookies through your browser settings.
                    </p>

                    <h3>4. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us.
                    </p>
                </div>
            </main>
        </div>
    );
}
