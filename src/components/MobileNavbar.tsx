import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
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
        className={`fixed bottom-20 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300
        ${darkMode ? "bg-[var(--primary)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
        hover:scale-105 md:hidden`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Mobile-only Back to Top Button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-32 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300
          ${darkMode ? "bg-[var(--primary)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
          hover:scale-105 md:hidden`}
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Bottom Navbar */}
      <nav
        className={`${bgColor} ${textColor} fixed bottom-0 left-0 w-full h-20 flex justify-around items-center font-[var(--font-sans)] shadow-lg z-40 transition-colors duration-500 md:hidden`}
      >
        <Link to="/" className="flex flex-col items-center">
          <Home className={iconSize} />
          <span className="text-xs font-bold mt-1">Home</span>
        </Link>

        <Link to="/scan" className="flex flex-col items-center">
          <Camera className={iconSize} />
          <span className="text-xs font-bold mt-1">Scan</span>
        </Link>

        <Link to="/my-plants" className="flex flex-col items-center">
          <Leaf className={iconSize} />
          <span className="text-xs font-bold mt-1">My Plants</span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center">
          <User className={iconSize} />
          <span className="text-xs font-bold mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
