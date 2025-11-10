import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import MirAI_Dark_Logo from "../assets/MirAI_Dark_Logo.png";
import MirAI_light_Logo from "../assets/MirAI_light_Logo.png";
import { Home, Camera, Leaf, User, Sun, Moon, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function MobileNavbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [showTopButton, setShowTopButton] = useState(false);

  const bgColor = darkMode
    ? "bg-gradient-to-r from-white to-green-300"
    : "bg-gradient-to-r from-green-500 to-green-950";
  const textColor = darkMode ? "text-emerald-950" : "text-white";
  const iconSize = "w-6 h-6";

  // Show back-to-top button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 100); // show after 100px scroll
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Floating Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`fixed bottom-25 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300
        ${darkMode ? "bg-[var(--primary)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
        hover:scale-105 md:hidden`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Mobile-only Back to Top Button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-40 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300
          ${darkMode ? "bg-[var(--primary)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
          hover:scale-105 md:hidden`}
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Bottom Navbar */}
      <nav
        className={`${bgColor} ${textColor} fixed bottom-0 left-0 w-full h-24 flex justify-around items-center font-[var(--font-sans)] shadow-lg z-40 transition-colors duration-500 md:hidden`}
      >
        {/* Logo with text below */}
        <Link to="/" className="flex flex-col items-center group">
          <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full overflow-hidden ring-2 ring-[var(--primary)]/40 shadow-sm transition-transform duration-300 group-hover:scale-110">
            <img
              src={darkMode ? MirAI_Dark_Logo : MirAI_light_Logo}
              alt="MirAI Logo"
              className="w-full h-full rounded-full aspect-square object-cover"
            />
          </div>
          <span className="text-xs xs:text-sm font-bold font-[var(--font-logo)] mt-1 group-hover:scale-105 transition-transform">
            MirAI
          </span>
        </Link>

        <Link to="/" className="flex flex-col items-center group">
          <Home className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 transition-all group-hover:scale-110" />
          <span className="text-xs xs:text-sm font-bold mt-1">Home</span>
        </Link>

        <Link to="/scan" className="flex flex-col items-center group">
          <Camera className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 transition-all group-hover:scale-110" />
          <span className="text-xs xs:text-sm font-bold mt-1">Scan</span>
        </Link>

        <Link to="/my-garden" className="flex flex-col items-center group">
          <Leaf className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 transition-all group-hover:scale-110" />
          <span className="text-xs xs:text-sm font-bold mt-1">Garden</span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center group">
          <User className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 transition-all group-hover:scale-110" />
          <span className="text-xs xs:text-sm font-bold mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
