import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Mail } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface ForgotPasswordProps {
  supabase: typeof supabase;
}

export default function ForgotPassword({ supabase }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleForgotPassword = async () => {
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // Supabase will add the recovery token as a hash fragment (#access_token=...)
      // The redirect URL should just be the reset-password page without extra params
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) throw error;

      setMessage(
        "✅ If your email is registered, a password reset link has been sent. Please check your inbox."
      );

      // Optional: redirect to login page after a few seconds
      // setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setMessage("Error sending reset email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${darkMode ? 'bg-[var(--background)]' : 'bg-[var(--background)]'}`}>
      <div className={`w-full max-w-md shadow-lg rounded-2xl p-8 ${darkMode ? 'bg-[var(--navbar)] text-white' : 'bg-white text-[var(--navbar)]'}`}>
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--primary)]">
          Forgot Password
        </h1>

        {message && (
          <p
            className={`mb-4 text-center ${
              message.startsWith("✅")
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }`}
          >
            {message}
          </p>
        )}

        <div className="relative w-full mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] pr-10 ${
              darkMode 
                ? 'bg-[#1f1f1f] text-white border-gray-600 placeholder-gray-400' 
                : 'bg-white text-[var(--navbar)] border-gray-300 placeholder-gray-500'
            }`}
          />
          <Mail
            size={20}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <button
          onClick={handleForgotPassword}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 ${
            darkMode
              ? 'bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] active:scale-95'
              : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className={`w-full mt-4 py-3 rounded-xl font-semibold border cursor-pointer transition-all duration-200 ${
            darkMode
              ? 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] active:scale-95'
              : 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95'
          }`}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
