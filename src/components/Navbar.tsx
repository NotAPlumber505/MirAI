import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar(props:any) {
  const { darkMode, toggleDarkMode } = useTheme();

  const linkClasses =
    "font-bold px-4 py-2 rounded-[40px] transition-all duration-300 cursor-pointer";

  // Hover colors
  const lightHover = "hover:bg-[#81C784] hover:text-white hover:scale-105"; // prettier green for light mode
  const darkHover = "hover:bg-[var(--primary)] hover:text-white hover:scale-105";

  const logoHover = darkMode
    ? "hover:text-[var(--primary)] hover:scale-105"
    : "hover:text-yellow-400 hover:scale-105";
  return (
    <nav
      className={`w-full fixed top-0 z-50 px-8 py-4 flex items-center font-[var(--font-logo)] shadow-md
                  ${darkMode ? "bg-gradient-to-r from-white to-green-300" : "bg-gradient-to-r from-yellow-100 via-yellow-300 to-green-950"}
                  transition-colors duration-500`}
    >
      <Link
        to="/"
        className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-[var(--background)]" : "text-[var(--primary)]"} ${logoHover}`}
      >
        MirAI
      </Link>

      <div className="flex flex-1 justify-center gap-8 md:gap-12 text-lg md:text-xl mx-16">
        <Link
          className={`${linkClasses} ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} ${darkMode ? darkHover : lightHover}`}
          to="/"
        >
          Home
        </Link>
        <Link
          className={`${linkClasses} ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} ${darkMode ? darkHover : lightHover}`}
          to={props.isLoggedIn ? "/scan":"/login"}
        >
          Scan
        </Link>
        <Link
          className={`${linkClasses} ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} ${darkMode ? darkHover : lightHover}`}
          to={props.isLoggedIn ? "/my-plants":"/login"}
        >
          My Garden
        </Link>
        <Link
          className={`${linkClasses} ${darkMode ? "text-emerald-950" : "text-[var(--navbar)]"} ${darkMode ? darkHover : lightHover}`}
          to={props.isLoggedIn ? "/profile":"/login"}
        >
          {props.isLoggedIn?<>Profile</>:<>Login</>}
        </Link>
      </div>

      <button
        onClick={toggleDarkMode}
        className={`px-4 py-2 rounded font-medium transition cursor-pointer
                    ${darkMode
                      ? "bg-[var(--navbar)] text-[var(--primary)] hover:bg-[var(--primary-hover)]"
                      : "bg-white text-[var(--navbar)] hover:bg-[var(--primary-hover)]"
                    }`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}
