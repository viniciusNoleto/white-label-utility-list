export function WavesBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-linear-to-b from-primary-50 via-stone-50 to-stone-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
    >
      <div className="absolute bottom-0 left-0 right-0 h-2/3">
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-drift-slow text-primary-200 dark:text-primary-900/80"
          viewBox="0 0 2880 600"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,300 C120,340 240,260 360,300 C480,340 600,260 720,300 C840,340 960,260 1080,300 C1200,340 1320,260 1440,300 C1560,340 1680,260 1800,300 C1920,340 2040,260 2160,300 C2280,340 2400,260 2520,300 C2640,340 2760,260 2880,300 L2880,600 L0,600 Z" />
        </svg>

        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-drift-medium text-primary-300/90 dark:text-primary-800/80"
          viewBox="0 0 2880 600"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,340 C120,290 240,390 360,340 C480,290 600,390 720,340 C840,290 960,390 1080,340 C1200,290 1320,390 1440,340 C1560,290 1680,390 1800,340 C1920,290 2040,390 2160,340 C2280,290 2400,390 2520,340 C2640,290 2760,390 2880,340 L2880,600 L0,600 Z" />
        </svg>

        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-drift-fast text-primary-500/80 dark:text-primary-700/70"
          viewBox="0 0 2880 600"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,420 C120,450 240,390 360,420 C480,450 600,390 720,420 C840,450 960,390 1080,420 C1200,450 1320,390 1440,420 C1560,450 1680,390 1800,420 C1920,450 2040,390 2160,420 C2280,450 2400,390 2520,420 C2640,450 2760,390 2880,420 L2880,600 L0,600 Z" />
        </svg>
      </div>
    </div>
  );
}
