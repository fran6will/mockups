import Header from '@/components/ui/Header';
import Banner from '@/components/ui/Banner';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Banner />
            <Header />
            <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-lg prose-headings:font-bold prose-headings:text-ink prose-p:text-ink/80 max-w-none">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using Copié-Collé, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service.
                    </p>

                    <h3>2. Description of Service</h3>
                    <p>
                        Copié-Collé provides an AI-powered tool for generating product mockups. We reserve the right to modify or discontinue the service at any time without notice.
                    </p>

                    <h3>3. User Accounts</h3>
                    <p>
                        You are responsible for maintaining the security of your account and password. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h3>4. Intellectual Property</h3>
                    <p>
                        <strong>Your Content:</strong> You retain full ownership of the logos and designs you upload. You grant us a temporary license to process this content solely for the purpose of generating your mockups.
                    </p>
                    <p>
                        <strong>Platform:</strong> The interface, code, and proprietary AI implementations are owned by Copié-Collé.
                    </p>

                    <h3>5. Prohibited Use</h3>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Upload content that is illegal, harmful, or violates the rights of others.</li>
                        <li>Reverse engineer or attempt to extract the source code of the platform.</li>
                        <li>Use the service to generate misleading or fraudulent content.</li>
                    </ul>

                    <h3>6. Limitation of Liability</h3>
                    <p>
                        The service is provided "as is" without warranties of any kind. Copié-Collé shall not be liable for any indirect, incidental, or consequential damages resulting from the use of the service.
                    </p>

                    <h3>7. Governing Law</h3>
                    <p>
                        These terms shall be governed by and construed in accordance with the laws of Canada.
                    </p>
                </div>
            </main>
        </div>
    );
}
