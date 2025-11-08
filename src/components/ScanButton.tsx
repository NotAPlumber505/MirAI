import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function ScanButton() {
  const { darkMode } = useTheme();
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setClicked(true);
    navigate("/scan");
  };

  const baseClasses =
    "w-[499px] h-28 rounded-[50px] flex items-center justify-center font-bold text-3xl font-['Poppins'] transition-all duration-300 cursor-pointer";

  const finalClasses = `${baseClasses} ${
    darkMode
      ? clicked
        ? "bg-[var(--primary)] text-[var(--background)] border-4 border-[var(--background)]"
        : "bg-white text-[var(--background)] hover:bg-[var(--primary-hover)] hover:scale-105"
      : clicked
      ? "bg-[var(--background)] text-[var(--primary)] border-4 border-[var(--primary)]"
      : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:scale-105"
  }`;

  return (
    <div className={finalClasses} onClick={handleClick}>
      Scan
    </div>
  );
}
