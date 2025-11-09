import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the hash fragment from the URL if it exists
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  // Try to get token from different possible locations
  const token = hashParams.get("access_token") || // From hash fragment
               searchParams.get("token") || // From query params
               new URLSearchParams(location.search).get("token"); // From redirect

  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setMessage("Missing token or email in URL.");
      setLinkExpired(true);
      return;
    }

    const handleRecovery = async () => {
      try {
        // If we have an access_token in the hash, we don't need to verify
        if (hashParams.get("access_token")) {
          setMessage("Please enter your new password.");
          return;
        }

        // Otherwise try to verify the recovery token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
          email,
        });

        if (error) {
          console.error("Recovery token error:", error);
          setMessage("This password reset link is invalid or has expired.");
          setLinkExpired(true);
        } else {
          setMessage("Token verified. Please enter your new password.");
        }
      } catch (err) {
        console.error("Recovery error:", err);
        setMessage("This password reset link is invalid or has expired.");
        setLinkExpired(true);
      }
    };

    handleRecovery();
  }, [token, email]);

  const handleResetPassword = async () => {
    if (!password) {
      setMessage("Please enter a new password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setMessage("Error updating password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!email) return;
    setMessage("Sending a new reset link...");
    const redirectTo = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setMessage("Error sending reset email: " + error.message);
    } else {
      setMessage("A new reset link has been sent to your email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {message && <p className="mb-4 text-center">{message}</p>}

      {!linkExpired ? (
        <>
          <div className="relative w-full max-w-md mb-4">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
            >
              {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full max-w-md py-3 rounded-xl font-semibold bg-[var(--primary)] text-white cursor-pointer hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </>
      ) : (
        <>
          <p className="text-center mb-4">
            Your password reset link has expired. Would you like to request a new one?
          </p>
          <button
            onClick={handleResendLink}
            className="w-full max-w-md py-3 rounded-xl font-semibold bg-[var(--primary)] text-white cursor-pointer hover:opacity-90 transition"
          >
            Resend Reset Link
          </button>
        </>
      )}
    </div>
  );
}
