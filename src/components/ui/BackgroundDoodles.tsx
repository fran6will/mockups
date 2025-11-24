export default function BackgroundDoodles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {/* Top Left Curve */}
            <svg
                className="absolute top-0 left-0 w-[800px] h-[800px] -translate-x-1/3 -translate-y-1/4 opacity-[0.03] text-ink"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10,10 Q50,50 90,10"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="blur-[1px]"
                />
                <path
                    d="M-20,50 Q30,120 120,30"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                    fill="none"
                />
            </svg>

            {/* Right Side Big Loop */}
            <svg
                className="absolute top-[20%] right-0 w-[1000px] h-[1000px] translate-x-1/3 opacity-[0.04] text-ink"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M200,0 C150,50 50,50 50,150 C50,250 150,250 200,200"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    strokeLinecap="round"
                    fill="none"
                    className="blur-[2px]"
                />
            </svg>

            {/* Bottom Left Squiggle */}
            <svg
                className="absolute bottom-0 left-0 w-[600px] h-[600px] -translate-x-1/4 translate-y-1/4 opacity-[0.03] text-ink"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0,100 C30,70 70,130 100,0"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    fill="none"
                />
            </svg>
        </div>
    );
}
