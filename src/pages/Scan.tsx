import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Scan() {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file)); // preview the image
    }
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewURL(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-center transition-colors duration-500 px-4
        ${darkMode ? "bg-[var(--background)] text-white" : "bg-[var(--background)] text-[var(--navbar)]"}
      `}
    >
      {!selectedFile ? (
        <>
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mt-40 mb-30 font-[var(--font-logo)]">
            Upload a photo of your plant 🌱✨
          </h1>

          {/* Upload Area */}
          <div
            className={`w-80 h-80 mb-50 md:w-[24rem] md:h-[24rem] flex flex-col items-center justify-center rounded-[50px] cursor-pointer shadow-lg transition-all duration-300
              ${darkMode ? "bg-[var(--navbar)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
              hover:scale-105 active:scale-95
            `}
            onClick={handleUploadClick}
          >
            <Upload className="w-16 h-16 mb-10" />
            <span className="text-2xl font-semibold">Upload Picture</span>
          </div>

          {/* Hidden File Input */}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Mobile-only footer */}
          <footer className="mt-20 mb-10 text-sm block md:hidden">
            <p
              className={`${
                darkMode ? "text-white" : "text-[var(--navbar)]"
              } transition-colors duration-300`}
            >
              © 2025 MirAI. All rights reserved.
            </p>
          </footer>
        </>
      ) : (
        <>
          {/* Plant Identified Section */}
          <h2
          className={`text-3xl md:text-4xl font-bold mt-10 md:mt-40 mb-6 transition-colors duration-300
            ${darkMode ? "text-[var(--navbar)]" : "text-[var(--primary)]"}
          `}
          >
            Plant Identified!
          </h2>

          {/* Image Preview */}
          {previewURL && (
            <div className="w-full max-w-md mb-8">
              <img
                src={previewURL}
                alt="Uploaded Plant"
                className="w-full h-auto rounded-3xl shadow-xl object-contain transition-all duration-300"
              />
            </div>
          )}

          {/* Plant Info Fields */}
          <div className="text-left w-full max-w-md space-y-2 md:space-y-3 text-base md:text-lg">
            {[
              "Name",
              "Species",
              "Common Names",
              "Family/Genus",
              "Overall Health",
              "Scan Date",
            ].map((label) => (
              <p key={label}>
                <span className="font-semibold text-[var(--primary)]">{label}:</span>{" "}
              </p>
            ))}
          </div>

          {/* Upload Another Button */}
          <button
          onClick={handleReset}
          className={`mt-10 mb-4 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
            ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
            : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
          >
            Upload another?
          </button>

          {/* View in My Plants Button */}
          <button
          onClick={() => navigate("/my-plants")}
          className={`mt-4 mb-40 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
            ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
            : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
          >
            View in My Plants
          </button>

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
        </>
      )}
    </div>
  );
}
