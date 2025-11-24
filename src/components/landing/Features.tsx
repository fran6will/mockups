import { Zap, Download, Image as ImageIcon } from 'lucide-react';

export default function Features() {
    return (
        <section className="py-20 bg-teal/5 border-y border-teal/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal mx-auto shadow-sm border border-teal/10">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink">Instant Generation</h3>
                        <p className="text-ink/60 leading-relaxed">
                            Upload your design and get a professional mockup in under 3 seconds. No waiting, no rendering queues.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal mx-auto shadow-sm border border-teal/10">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink">No Photoshop Needed</h3>
                        <p className="text-ink/60 leading-relaxed">
                            Forget complex layers and smart objects. Our AI handles the lighting, shadows, and displacement maps for you.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal mx-auto shadow-sm border border-teal/10">
                            <Download size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink">4K Commercial License</h3>
                        <p className="text-ink/60 leading-relaxed">
                            Download high-resolution images ready for your Etsy listing, Shopify store, or Instagram feed.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
