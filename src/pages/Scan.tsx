import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Scan(props: any) {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const navigate = useNavigate();
  const supabase = props.supabase;
  const location = useLocation();

  //Redirect if not logged in
  useEffect(() => {
    if (!props.isLoggedIn) {
      const kickIfnotLogged = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) navigate("/login");
      };
      kickIfnotLogged();
    }
  }, [location.pathname]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileToDatabase(file);
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

  // Framer Motion text animation variant
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
          <motion.h1
            className="text-4xl md:text-5xl font-bold mt-40 mb-30 font-[var(--font-logo)]"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Upload a photo of your plant 🌱✨
          </motion.h1>

          {/* Upload Area */}
          <motion.div
            className={`w-80 h-80 mb-50 md:w-[24rem] md:h-[24rem] flex flex-col items-center justify-center rounded-[50px] cursor-pointer shadow-lg transition-all duration-300
              ${darkMode ? "bg-[var(--navbar)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
              hover:scale-105 active:scale-95
            `}
            onClick={handleUploadClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } }}
          >
            <Upload className="w-16 h-16 mb-10" />
            <span className="text-2xl font-semibold">Upload Picture</span>
          </motion.div>

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
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mt-10 md:mt-40 mb-6 transition-colors duration-300 ${
              darkMode ? "text-[var(--navbar)]" : "text-[var(--primary)]"
            }`}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Plant Identified!
          </motion.h2>

          {/* Image Preview */}
          {previewURL && (
            <motion.div
              className="w-full max-w-md mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
            >
              <img
                src={previewURL}
                alt="Uploaded Plant"
                className="w-full h-auto rounded-3xl shadow-xl object-contain transition-all duration-300"
              />
            </motion.div>
          )}

          {/* Plant Info Fields */}
          <motion.div
            className="text-left w-full max-w-md space-y-2 md:space-y-3 text-base md:text-lg"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            {["Name", "Species", "Common Names", "Family/Genus", "Overall Health", "Scan Date"].map(
              (label) => (
                <p key={label}>
                  <span className="font-semibold text-[var(--primary)]">{label}:</span>{" "}
                </p>
              )
            )}
          </motion.div>

          {/* Upload Another Button */}
          <motion.button
            onClick={handleReset}
            className={`mt-10 mb-4 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
              ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Upload another?
          </motion.button>

          {/* View in My Plants Button */}
          <motion.button
            onClick={() => navigate("/my-garden")}
            className={`mt-4 mb-40 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
              ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            View in My Plants
          </motion.button>

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

  //Database functions
  async function uploadFileToDatabase(file: any) {
    const filePath = await uploadFileToBucket(file);
    if (filePath === null) {
      console.log("Failed upload! Kicking user to homepage.");
      navigate("/");
      return;
    }
    await insertIntoUsersPlantsTable(filePath);
    console.log("Done!");
  }

  async function getUserID() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user.id;
    console.log("Failed to get user's ID!");
  }
  async function uploadFileToBucket(file: any) {
    const userID = await getUserID();
    const filePath = `${userID}/flower1.png`;
    const { data, error } = await supabase.storage.from("plant_images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      console.log("Error uploading image! Error: " + error);
      return null;
    }
    return filePath;
  }

  async function insertIntoUsersPlantsTable(filePath: any) {
    const { error } = await supabase.from("usersplants").insert({ plant_path: filePath });
    if (error) console.log("Supabase Error: " + error);
  }
}
