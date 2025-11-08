import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ScanButton from "../components/ScanButton";
import { Link } from "react-router-dom";

export default function Home() {
  const { darkMode } = useTheme();
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

  const stepsColor = darkMode ? "text-[var(--navbar)]" : "text-[#013220]";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-[var(--background-dark)]" : "bg-[var(--background)]"
      } text-[var(--primary)]`}
    >
      {/* ✅ Navbar comes from NavbarLayout automatically */}

      <main className="flex-1 pt-32 px-8 md:px-16">
        <div
          ref={scrollRef}
          className="transition-all duration-700 opacity-0 translate-y-6 flex flex-col items-center"
        >
          {/* Heading */}
          <h1 className="text-4xl text-center md:text-5xl font-bold mb-12 font-[var(--font-logo)]">
            🌿 Welcome to MirAI, your AI plant companion!
          </h1>

          {/* Subheading */}
          <div className="text-4xl text-center md:text-5xl mb-20 font-[var(--font-logo)]">
            Identify. Nurture. Grow.
          </div>

          {/* How it works */}
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

          {/* Tagline */}
          <p
            className={`mt-20 text-3xl text-center font-normal ${
              darkMode ? "text-[var(--navbar)]" : "text-[#013220]"
            }`}
          >
            🪴 Let’s make your world a little greener.
          </p>

          {/* Scan Button and Mobile "Meet the Team" button */}
          <div className="mt-30 mb-100 flex flex-col items-center">
          <ScanButton />

          {/* Mobile-only "Meet the Team" button with hover states */}
            <Link
            to="/team"
            className={`mt-20 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
                ${darkMode 
                    ? "bg-[var(--primary)] text-[var(--background)] active:bg-[var(--primary-hover)] active:text-white active:scale-95" 
                    : "bg-[var(--primary)] text-white active:bg-[var(--primary-hover)] active:text-[var(--background)] active:scale-95"
                }
                md:hidden`} // hide on desktop
            >
            Meet the Team
            </Link>
          </div>

          {/* Mobile-only footer */}
          <footer className="mt-16 mb-10 text-sm block md:hidden">
            <p
              className={`${
                darkMode ? "text-white" : "text-[var(--navbar)]"
              } transition-colors duration-300`}
            >
              © 2025 MirAI. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
