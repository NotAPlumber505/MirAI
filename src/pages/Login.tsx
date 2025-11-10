// Login.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { Eye, EyeOff } from "lucide-react";
import MirAI_Dark_Logo from "../assets/MirAI_Dark_Logo.png";
import MirAI_light_Logo from "../assets/MirAI_light_Logo.png";
import googleIcon from "../assets/google-icon.svg";
import { supabase } from "../supabaseClient";

export default function Login({ supabase }: { supabase: typeof import("../supabaseClient").supabase }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const controls = useAnimation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);

  // Animate appearance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            entry.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { threshold: 0.2 }
    );
    if (galleryRef.current) observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, []);

  // Navigate when signed in
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate("/");
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  async function handleSubmit() {
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 12 characters and include uppercase letters, numbers, and symbols."
      );
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Only insert user data if signup was successful and we have a user
        if (data.user) {
          const { error: insertError } = await supabase
            .from("users")
            .insert({ 
              id: data.user.id,
              email, 
              username: username || null 
            });
          
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            // Don't throw here - user is already created in auth.users
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Supabase Error:", error.message);
      setEmailError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);
    }
  }

  const toggleRegistering = () => {
    setIsRegistering(!isRegistering);
    setEmail("");
    setUsername("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setShowPassword(false);
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  const bgColor = darkMode ? "bg-[var(--background-dark)]" : "bg-[var(--background)]";
  const textColor = darkMode ? "text-white" : "text-[var(--navbar)]";
  const inputBg = darkMode ? "bg-[#1f1f1f]" : "bg-white";
  const buttonColor = darkMode
    ? "bg-[var(--primary)] text-white"
    : "bg-[var(--primary)] text-[var(--background)]";

  const galleryImages = [
    new URL("../assets/plants/plant1.jpg", import.meta.url).href,
    new URL("../assets/plants/plant2.jpeg", import.meta.url).href,
    new URL("../assets/plants/plant3.jpeg", import.meta.url).href,
    new URL("../assets/plants/plant4.jpeg", import.meta.url).href,
    new URL("../assets/plants/plant5.jpg", import.meta.url).href,
    new URL("../assets/plants/plant6.jpg", import.meta.url).href,
    new URL("../assets/plants/plant7.jpg", import.meta.url).href,
    new URL("../assets/plants/plant8.jpg", import.meta.url).href,
    new URL("../assets/plants/plant9.jpg", import.meta.url).href,
    new URL("../assets/plants/plant10.jpg", import.meta.url).href,
    new URL("../assets/plants/plant11.jpg", import.meta.url).href,
  ];

  const handlePause = () => controls.stop();
  const handleResume = () => {
    controls.start({
      x: ["0%", "-50%"],
      transition: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" },
    });
  };

  useEffect(() => {
    handleResume();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${bgColor} ${textColor} transition-colors duration-300`}>
      {/* Welcome Message with single logo instance */}
      <div className="text-center mt-10 px-4 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-2 group">
          <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-[var(--primary)]/30 shadow-sm transition-transform duration-300 group-hover:scale-110">
            <img
              src={darkMode ? MirAI_Dark_Logo : MirAI_light_Logo}
              alt="MirAI Logo"
              className="w-full h-full rounded-full aspect-square object-cover"
              loading="lazy"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold font-[var(--font-logo)] leading-tight transition-transform duration-300 group-hover:scale-105">
            Welcome to MirAI 🌿
          </h2>
        </div>
        <p className="text-lg opacity-90 max-w-xl">
          Your AI-powered plant companion, here to help your garden thrive.
        </p>
      </div>

      {/* Login / Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center justify-center flex-1 px-6 py-12"
      >
        <div className={`w-full max-w-md rounded-2xl p-8 shadow-lg ${inputBg}`}>
          <h1 className="text-3xl font-bold text-center mb-8 font-[var(--font-logo)]">
            {isRegistering ? "Create your MirAI account" : "Welcome back to MirAI 🌿"}
          </h1>

          {isRegistering && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-semibold">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition ${inputBg} ${textColor}`}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Email Address</label>
            {emailError && <p className="text-red-500 text-sm mb-1">{emailError}</p>}
            <input
              type="email"
              placeholder="e.g., 123@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition ${inputBg} ${textColor}`}
            />
          </div>

          <div className="mb-2 relative">
            <label className="block mb-1 text-sm font-semibold">Password</label>
            {passwordError && <p className="text-red-500 text-sm mb-1">{passwordError}</p>}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition ${inputBg} ${textColor}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-[65%] -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-6">
            <button
              className="text-sm text-[var(--primary)] hover:underline cursor-pointer"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || !email || !password}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl font-semibold ${buttonColor} transition-all duration-300 cursor-pointer`}
          >
            {loading ? "Processing..." : isRegistering ? "Sign Up" : "Login"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignIn}
            aria-label="Sign in with Google"
            className={`mt-4 mx-auto w-[260px] sm:w-[280px] flex items-center justify-start gap-2 py-2 px-4 rounded-xl border font-medium transition-all duration-300 cursor-pointer ${
              darkMode
                ? "border-gray-600 text-white hover:bg-[var(--navbar)] hover:text-[var(--background)]"
                : "border-gray-600 text-[var(--primary)] hover:bg-gray-100 hover:text-[var(--primary-hover)]"
            }`}
          >
            <img src={googleIcon} alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap leading-none">Sign in with Google</span>
          </motion.button>

          <p className="mt-6 text-center text-sm">
            {isRegistering ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              className="text-[var(--primary)] font-semibold hover:underline cursor-pointer"
              onClick={toggleRegistering}
            >
              {isRegistering ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Sliding Image Gallery */}
      <div
        ref={galleryRef}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        className="w-full overflow-hidden py-8 select-none cursor-grab active:cursor-grabbing"
      >
        <motion.div
          className="flex space-x-6"
          drag="x"
          dragConstraints={{ left: -((galleryImages.length - 1) * 300), right: 0 }}
          animate={controls}
        >
          {[...galleryImages, ...galleryImages].map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt={`Plant ${i}`}
              className="w-64 h-48 rounded-2xl object-cover shadow-md transition-transform duration-300 hover:scale-105"
              draggable={false}
            />
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer
        className={`w-full h-32 flex items-center px-8 md:px-16 justify-between transition-colors duration-300 ${
          darkMode ? "bg-white text-[var(--background)]" : "bg-[var(--navbar)] text-white"
        }`}
      >
        <div className="text-sm md:text-lg font-['Poppins']">© 2025 MirAI. All rights reserved.</div>
        <div
          className="text-sm md:text-lg font-['Poppins'] cursor-pointer hover:underline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to Top
        </div>
        <Link
          to="/team"
          className="text-sm md:text-lg font-['Poppins'] cursor-pointer hover:underline"
        >
          Meet the Team
        </Link>
      </footer>
    </div>
  );
}
