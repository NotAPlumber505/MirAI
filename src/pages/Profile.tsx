import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

export default function Profile({ supabase, isLoggedIn }: any) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [avatars, setAvatars] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState("");
  const currentAvatar = avatars[index];

  // Framer Motion text animation variant
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        // Always verify session server-side; if no session, redirect to login
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          navigate("/login");
          return;
        }

        const user = session.user;
        setUsername(user?.user_metadata?.username || user?.email || "User");

        // Fetch avatars for the logged-in user. Guard errors to avoid noisy fetch failures.
        const { data: avatarData, error } = await supabase
          .from("avatars")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching avatars:", error);
          setAvatars([]);
        } else {
          setAvatars(avatarData || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching avatars:", err);
        setAvatars([]);
      }
    };
    fetchAvatars();
  }, [isLoggedIn]);

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Supabase error!", error);
    else navigate("/");
  }

  async function deleteAvatar(indexToDelete: number) {
    const avatarToDelete = avatars[indexToDelete];

    const { error } = await supabase
      .from("avatars")
      .delete()
      .eq("id", avatarToDelete.id);

    if (!error) {
      setAvatars((prev) => prev.filter((_, i) => i !== indexToDelete));
      setIndex(0);
    } else {
      console.log("Error deleting avatar:", error);
    }
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col md:flex-row justify-between items-center px-6 md:px-16 pt-10 pb-36 transition-colors duration-500 ${
        darkMode
          ? "bg-[var(--background)] text-white"
          : "bg-[var(--background)] text-[var(--navbar)]"
      }`}
    >
      {/* 🖐️ Greeting */}
      <motion.h1
        className={`absolute top-16 md:top-30 left-8 text-3xl md:text-6xl font-semibold pb-8 md:pb-0 ${
          darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        Hello, {username}! 🌿
      </motion.h1>

      {/* 🧭 Desktop Logout */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className={`hidden md:flex items-center gap-2 absolute top-30 right-20 px-10 py-4 rounded-lg font-semibold cursor-pointer transition ${
          darkMode
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        Logout
      </motion.button>

      {/* 🪴 No Avatars */}
      {avatars.length === 0 ? (
        <div className="relative w-full flex flex-col justify-center items-center text-center px-6 md:px-16 flex-1">
          <motion.div
            className="flex flex-col justify-center items-center h-full"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h2
              className={`text-3xl font-bold mb-4 ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              You don’t have any plant avatars yet! 🌱
            </h2>
            <p className="text-lg mb-6">
              Scan a plant to start your journey and take care of your green friends.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/scan")}
              className={`px-6 py-3 rounded-lg font-semibold cursor-pointer ${
                darkMode
                  ? "bg-[var(--primary)] hover:bg-green-700 text-white"
                  : "bg-[var(--primary)] hover:bg-green-600 text-white"
              }`}
            >
              Go to Scan Page
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* 🌻 Left: Avatar Display */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col items-center md:items-start mt-40 md:mt-56 mb-8 md:mb-0"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h1
              className={`text-3xl md:text-5xl font-bold mb-6 ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Chosen Avatar:
            </h1>

            <motion.img
              key={currentAvatar?.name}
              src={currentAvatar?.image}
              alt={currentAvatar?.name}
              className="rounded-full w-64 h-64 md:w-[400px] md:h-[400px] object-cover shadow-lg border-4 border-[var(--primary)] mb-6 cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />

            {/* Arrows */}
            <div className="flex gap-8 items-center">
              {index > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIndex(index - 1)}
                  className={`text-[var(--primary)] text-4xl font-bold border-2 rounded-full px-3 py-1 transition-transform cursor-pointer`}
                >
                  ←
                </motion.button>
              )}
              {index < avatars.length - 1 && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIndex(index + 1)}
                  className={`text-[var(--primary)] text-4xl font-bold border-2 rounded-full px-3 py-1 transition-transform cursor-pointer`}
                >
                  →
                </motion.button>
              )}
            </div>

            {/* Delete Avatar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => deleteAvatar(index)}
              className={`mt-6 px-5 py-2 rounded-lg font-semibold transition cursor-pointer ${
                darkMode
                  ? "bg-[var(--primary)] hover:bg-[var(--navbar)] text-[var(--background))]"
                  : "bg-[var(--primary)] hover:bg-[var(--navbar)] text-[var(--background)]"
              }`}
            >
              Free This Plant 🌾
            </motion.button>
          </motion.div>

          {/* 🌿 Right: Plant Info */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col md:pl-10 text-left"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h2
              className={`text-4xl font-semibold mt-10 md:mt-40 mb-4 text-center md:text-left ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Plant Information
            </h2>

            <div className="space-y-2 text-lg text-[var(--navbar)]">
              <p>
                <strong className="text-[var(--primary)]">Name: </strong>
                🌻 {currentAvatar?.name}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Species: </strong>
                {currentAvatar?.species}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Common Names: </strong>
                {currentAvatar?.commonNames}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Family/Genus: </strong>
                {currentAvatar?.familyGenus}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Description: </strong>
                {currentAvatar?.description}
              </p>
            </div>

            <h2
              className={`text-4xl font-semibold mt-10 mb-4 text-center md:text-left ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Health Assessment
            </h2>

            <div className="space-y-2 text-lg text-[var(--navbar)]">
              <p>
                <strong className="text-[var(--primary)]">Overall Health: </strong>
                {currentAvatar?.health}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Detected issues: </strong>
                {currentAvatar?.issues}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Cause: </strong>
                {currentAvatar?.cause}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Recommended action: </strong>
                {currentAvatar?.action}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Last Scan Date: </strong>
                {currentAvatar?.lastScan}
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* 📱 Mobile Logout */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className={`absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex md:hidden items-center justify-center gap-2 w-11/12 max-w-sm px-4 py-3 rounded-lg font-medium cursor-pointer transition ${
          darkMode
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        Logout
      </motion.button>

      {/* 📱 Mobile Footer */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm block md:hidden text-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
