import Image from 'next/image';

export default function Banner() {
    return (
        <div className="w-full bg-cream border-b border-ink/5">
            <div className="relative w-full h-32 md:h-48 lg:h-64 overflow-hidden">
                <Image
                    src="/banner.webp"
                    alt="Copié-Collé Branding"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
        </div>
    );
}
