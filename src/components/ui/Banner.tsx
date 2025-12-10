import Image from 'next/image';

export default function Banner() {
    return (
        <div className="w-full bg-cream border-b border-ink/5">
            <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden">
                <Image
                    src="/banner_copypaste.webp"
                    alt="Copié-Collé Branding"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
        </div>
    );
}
