import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import ScanButton from "../components/ScanButton";
import { Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home() {
  const { darkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkLogin() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log("Supabase Error:" + error);
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(!(data.session === null));
      }
    }
    checkLogin();
  }, []);

  // Wait until we know login status
  if (isLoggedIn === null) return null;

  // Redirect if not logged in
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Now render the normal Home page
  const stepsColor = darkMode ? "text-[var(--navbar)]" : "text-[#013220]";

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.6, staggerChildren: 0.2 },
        },
      }}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-[var(--background-dark)]" : "bg-[var(--background)]"
      } text-[var(--primary)]`}
    >
      {/* Navbar comes from NavbarLayout */}
      <main className="flex-1 pt-32 px-8 md:px-16">
        <motion.div variants={fadeVariant} className="flex flex-col items-center text-center">
          {/* Heading */}
          <motion.h1
            variants={fadeVariant}
            className="text-4xl md:text-5xl font-bold mb-12 font-[var(--font-logo)]"
          >
            🌿 Welcome to MirAI, your AI plant companion!
          </motion.h1>

          {/* Subheading */}
          <motion.div
            variants={fadeVariant}
            className="text-4xl md:text-5xl mb-20 font-[var(--font-logo)]"
          >
            Identify. Nurture. Grow.
          </motion.div>

          {/* How it works */}
          <motion.div
            variants={fadeVariant}
            className={`max-w-[900px] mx-auto flex flex-col space-y-6 ${stepsColor}`}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-left">🌱 How it works</h2>
            <ol className="list-decimal list-inside space-y-6 text-2xl font-normal leading-relaxed text-left md:text-justify">
              <li>Scan a plant — Upload or take a photo to identify your plant instantly.</li>
              <li>Learn & care — Get insights about its species, health, and care tips.</li>
              <li>Grow your avatar — Each successful scan helps your avatar bloom!</li>
            </ol>
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={fadeVariant}
            className={`mt-20 text-3xl text-center font-normal ${
              darkMode ? "text-[var(--navbar)]" : "text-[#013220]"
            }`}
          >
            🪴 Let’s make your world a little greener.
          </motion.p>

          {/* Scan Button + Mobile "Meet the Team" */}
          <motion.div variants={fadeVariant} className="mt-30 mb-100 flex flex-col items-center">
            <ScanButton />

            {/* Mobile-only "Meet the Team" button */}
            <Link
              to="/team"
              className={`mt-20 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
                darkMode
                  ? "bg-[var(--primary)] text-[var(--background)] active:bg-[var(--primary-hover)] active:text-white active:scale-95"
                  : "bg-[var(--primary)] text-white active:bg-[var(--primary-hover)] active:text-[var(--background)] active:scale-95"
              } md:hidden`}
            >
              Meet the Team
            </Link>
          </motion.div>

          {/* Mobile-only footer */}
          <motion.footer variants={fadeVariant} className="mt-16 mb-10 text-sm block md:hidden">
            <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
              © 2025 MirAI. All rights reserved.
            </p>
          </motion.footer>
        </motion.div>
      </main>
    </motion.div>
  );
}
