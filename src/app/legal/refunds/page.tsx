import { Metadata } from 'next';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
    title: 'Refund Policy | Copié-Collé',
    description: 'Our refund and return policy for digital mockup generation credits.',
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-cream">
            <Header />
            <main className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold text-ink mb-8">Refund Policy</h1>

                <div className="prose prose-lg text-ink/80 space-y-6">
                    <p className="text-ink/60 text-sm">Last updated: December 8, 2024</p>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">Digital Product Policy</h2>
                        <p>
                            Copié-Collé provides <strong>digital mockup generation services</strong>. All products are delivered
                            instantly via our web platform. Due to the nature of digital goods and AI-powered generation,
                            our refund policy differs from physical products.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">Subscription Refunds</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>7-Day Free Trial:</strong> Cancel anytime during your trial at no charge.</li>
                            <li><strong>Monthly/Annual Plans:</strong> You may cancel at any time. Your access continues until the end of your billing period. No partial refunds for unused time.</li>
                            <li><strong>First-Time Subscribers:</strong> If you're unsatisfied within 14 days of your first paid subscription, contact us for a full refund.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">Credit Pack Refunds</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Unused Credits:</strong> Full refund available within 30 days of purchase if no credits have been used.</li>
                            <li><strong>Partially Used Credits:</strong> Prorated refunds are not available once credits have been consumed.</li>
                            <li><strong>Technical Issues:</strong> If a generation fails due to a system error, we will restore your credits automatically.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">No Refunds For</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Generations that completed successfully but didn't meet creative expectations</li>
                            <li>User error (e.g., uploading incorrect images, wrong settings)</li>
                            <li>Credits used more than 30 days ago</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">How to Request a Refund</h2>
                        <p>
                            Contact us at <a href="mailto:copiecolle.ai@gmail.com" className="text-teal hover:underline">copiecolle.ai@gmail.com</a> with
                            your account email and reason for the refund request. We typically respond within 24-48 hours.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-ink mt-8 mb-4">Instant Digital Delivery</h2>
                        <p>
                            All mockups are generated and delivered instantly through our platform. There is no physical
                            shipping involved. Your generated images are available immediately for download.
                        </p>
                    </section>

                    <section className="bg-teal/5 border border-teal/20 rounded-xl p-6 mt-8">
                        <h3 className="font-bold text-ink mb-2">Questions?</h3>
                        <p className="text-ink/70">
                            If you have any questions about our refund policy, please reach out to{' '}
                            <a href="mailto:copiecolle.ai@gmail.com" className="text-teal hover:underline">copiecolle.ai@gmail.com</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
