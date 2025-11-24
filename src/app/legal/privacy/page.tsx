import Header from '@/components/ui/Header';
import Banner from '@/components/ui/Banner';
import Footer from '@/components/ui/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Banner />
            <Header />
            <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-lg prose-headings:font-bold prose-headings:text-ink prose-p:text-ink/80 max-w-none">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <p>
                        Welcome to Copié-Collé ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
                    </p>

                    <h3>1. What Information We Collect</h3>
                    <p>
                        <strong>Personal Information Provided by You:</strong> We collect names, email addresses, and billing information when you register for an account or make a purchase.
                    </p>
                    <p>
                        <strong>Content:</strong> We collect the images (logos, designs) you upload to generate mockups. We do not own your content.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use your personal information to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our AI mockup generation service.</li>
                        <li>Process your payments and manage your subscription via Lemon Squeezy.</li>
                        <li>Send you administrative information, such as order confirmations and password resets.</li>
                    </ul>

                    <h3>3. Sharing Information with Third Parties</h3>
                    <p>We only share information with the following third parties for the purpose of operating the service:</p>
                    <ul>
                        <li><strong>Google (Vertex AI):</strong> To process image generation requests.</li>
                        <li><strong>Supabase:</strong> To store user data and generated image history securely.</li>
                        <li><strong>Lemon Squeezy:</strong> To process payments and handle tax compliance as our Merchant of Record.</li>
                    </ul>

                    <h3>4. Data Retention</h3>
                    <p>
                        We retain your personal information only for as long as is necessary for the purposes set out in this privacy policy. You may request deletion of your account and data at any time.
                    </p>

                    <h3>5. Contact Us</h3>
                    <p>
                        If you have questions or comments about this policy, you may email us at support@nanobanana.pro.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
