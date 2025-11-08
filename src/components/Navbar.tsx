import { useState, useEffect } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <nav
      className={`w-full fixed top-0 z-50 px-8 py-4 flex items-center font-[var(--font-logo)] shadow-md
                  ${darkMode 
                    ? "bg-gradient-to-r from-white to-green-300" 
                    : "bg-gradient-to-r from-yellow-100 via-yellow-300 to-green-950"
                  } transition-colors duration-500`}
    >
      {/* Logo / Brand */}
      <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-emerald-950" : "text-[var(--primary)]"}`}>
        MirAI
      </h1>

      {/* Links */}
      <div className="flex flex-1 justify-center gap-8 md:gap-12 text-lg md:text-xl mx-16">
        <button className={`font-bold ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} hover:text-[var(--secondary-hover)] transition`}>
          Home
        </button>
        <button className={`font-bold ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} hover:text-[var(--secondary-hover)] transition`}>
          Scan
        </button>
        <button className={`font-bold ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} hover:text-[var(--secondary-hover)] transition`}>
          My Plants
        </button>
        <button className={`font-bold ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} hover:text-[var(--secondary-hover)] transition`}>
          Profile
        </button>
      </div>

      {/* Dark/Light mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`px-4 py-2 rounded font-medium transition cursor-pointer 
                    ${darkMode 
                      ? "bg-[var(--navbar)] from-[var(--primary)] to-[var(--primary-hover)] text-[var(--navbar)] hover:bg-[var(--primary-hover)]"
                      : "bg-white text-[var(--navbar)] hover:bg-[var(--primary-hover)]"
                    }`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}
