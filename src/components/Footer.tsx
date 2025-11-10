import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { frame } from "framer-motion";

export default function Footer() {
  const { darkMode } = useTheme();

  const footerBg = darkMode ? "bg-white" : "bg-[var(--navbar)]";
  const footerText = darkMode ? "text-[var(--background)]" : "text-white";

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={`${footerBg} ${footerText} w-full h-32 relative flex items-center px-16 transition-colors duration-300`}
    >
      {/* Left: copyright */}
      <div className="text-xl font-normal font-['Poppins']">
        © 2025 MirAI. All rights reserved.
      </div>

      {/* Center: Back to Top */}
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-normal font-['Poppins'] cursor-pointer hover:underline"
        onClick={handleBackToTop}
      >
        Back to Top
      </div>

      {/* Right: Meet the Team */}
      <div className="ml-auto flex items-center gap-6">
        <Link
          to="/team"
          className="text-xl font-normal font-['Poppins'] cursor-pointer hover:underline"
        >
          Meet the Team
        </Link>
      </div>
    </footer>
  );
}
