import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword({ supabase }: any) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login", // user comes back to login after reset
      });
      if (error) throw error;
      setMessage("Check your email for a password reset link!");
    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const bgColor = darkMode ? "bg-[var(--background-dark)] text-white" : "bg-[var(--background)] text-[var(--navbar)]";
  const inputBg = darkMode ? "bg-[#1f1f1f]" : "bg-white";

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${bgColor}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`w-full max-w-md rounded-2xl p-8 shadow-lg ${inputBg}`}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <p className="text-center mb-4">
          Enter your email to receive a password reset link.
        </p>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-4 ${inputBg}`}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendReset}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-[var(--primary)] text-white"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </motion.button>

        {message && <p className="text-center mt-4 text-sm">{message}</p>}
      </motion.div>
    </div>
  );
}
