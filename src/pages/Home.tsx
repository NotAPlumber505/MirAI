import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const { darkMode } = useTheme();

  // Ref for the container that animates on scroll
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    if (scrollRef.current) observer.observe(scrollRef.current);

    return () => observer.disconnect();
  }, []);

  // Colors for "How it works" section
  const stepsColor = darkMode ? "text-[var(--navbar)]" : "text-[#013220]";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-[var(--background-dark)]" : "bg-[var(--background)]"
      } text-[var(--primary)]`}
    >
      <Navbar />

      <main className="flex-1 pt-32 px-8 md:px-16">
        <div
          ref={scrollRef}
          className="transition-all duration-700 opacity-0 translate-y-6 flex flex-col items-center"
        >
          {/* Main welcome heading */}
          <h1 className="text-4xl text-center md:text-5xl font-bold mb-12 font-[var(--font-logo)]">
            🌿 Welcome to MirAI, your AI plant companion!
          </h1>

          {/* Identify. Nurture. Grow */}
          <div className="text-4xl text-center md:text-5xl mb-20 font-[var(--font-logo)]">
            Identify. Nurture. Grow.
          </div>

          {/* How it works section */}
          <div className={`max-w-[900px] mx-auto flex flex-col space-y-6 ${stepsColor}`}>
            <h2 className="text-2xl text-left md:text-3xl font-bold mb-6">
              🌱 How it works
            </h2>

            <ol className="list-decimal list-inside space-y-6 text-2xl font-normal leading-relaxed">
              <li>Scan a plant — Upload or take a photo to identify your plant instantly.</li>
              <li>Learn & care — Get insights about its species, health, and care tips.</li>
              <li>Grow your avatar — Each successful scan helps your avatar bloom!</li>
            </ol>
          </div>

          {/* Optional tagline centered */}
          <p
            className={`mt-20 text-3xl text-center font-normal ${
              darkMode ? "text-[var(--navbar)]" : "text-[#013220]"
            }`}
          >
            🪴 Let’s make your world a little greener.
          </p>

          {/* Scan Button - appears at the bottom */}
          <div className="mt-30 mb-100">
            <ScanButton />
          </div>
        </div>
      </main>
    </div>
  );
}
