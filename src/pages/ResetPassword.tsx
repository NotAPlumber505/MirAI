import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tokens and flags from URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hasHashToken = !!hashParams.get("access_token");
  const hashError = hashParams.get("error");
  const hashErrorCode = hashParams.get("error_code");
  const hashErrorDescription = hashParams.get("error_description");

  const queryToken = searchParams.get("token") || new URLSearchParams(location.search).get("token");
  const recoveryParam = searchParams.get("recovery") || new URLSearchParams(location.search).get("recovery");
  const hasRecoveryFlag = recoveryParam === "1" || recoveryParam === "true" || !!recoveryParam;
  const token = hasHashToken ? hashParams.get("access_token") : queryToken;

  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const passwordOk = (pwd: string) =>
    pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

  // Check if user already has an active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasActiveSession(!!session);
      setCheckingSession(false);
      
      if (session && !hasHashToken && !queryToken) {
        // User is logged in but no token in URL - allow direct password reset
        setMessage("You're logged in. Enter your new password below.");
        setLinkExpired(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (checkingSession) return; // Wait for session check to complete
    
    // If user has active session and no token, they can reset directly
    if (hasActiveSession && !hasHashToken && !queryToken && !hashError && !hashErrorCode) {
      return; // Skip token validation, allow direct reset
    }
    // If Supabase appended an error in the hash (e.g., otp_expired), show it and stop here
    if (hashError || hashErrorCode) {
      const expired = hashErrorCode === "otp_expired" || (hashErrorDescription ?? "").toLowerCase().includes("expired");
      const baseMsg = expired
        ? "This password reset link has expired."
        : "This password reset link is invalid or has expired.";
      setMessage(
        `${baseMsg} Please request a fresh link below and click it immediately when it arrives.`
      );
      setLinkExpired(true);
      return;
    }

    // If we don't have any token in hash or query, bail out early
    if (!hasHashToken && !queryToken) {
      // Special guidance when this is the first click from the recovery flow without token
      if (hasRecoveryFlag) {
        setMessage(
          "The reset link was opened but the authentication token is missing. This can happen if your email app pre-scanned the link. Please click 'Resend Reset Link' below to get a fresh link, then click it immediately when it arrives in your email."
        );
      } else {
        setMessage("Missing or invalid password reset token. Please use the link from your email.");
      }
      setLinkExpired(true);
      return;
    }

    const handleRecovery = async () => {
      try {
        // If we have an access_token in the hash, we don't need to verify; session should be active
        if (hasHashToken) {
          setMessage("Please enter your new password.");
          return;
        }

        // Otherwise try to verify the recovery token
        if (!email) {
          setMessage("Missing email in link. Please open the reset link directly from your email.");
          setLinkExpired(true);
          return;
        }
        const { error } = await supabase.auth.verifyOtp({
          token_hash: queryToken as string,
          type: "recovery",
          email,
        });

        if (error) {
          console.error("Recovery token error:", error);
          setMessage(
            "This password reset link is invalid or has expired. Please request a new link below and use it promptly."
          );
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
  }, [token, email, hasRecoveryFlag, hashError, hashErrorCode, hashErrorDescription, hasHashToken, queryToken, hasActiveSession, checkingSession]);

  const handleResetPassword = async () => {
    if (!password) {
      setMessage("Please enter a new password.");
      return;
    }
    if (!passwordOk(password)) {
      setMessage("Password must be at least 12 characters and include uppercase letters, numbers, and symbols.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
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
    const redirectTo = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}&recovery=1`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setMessage("Error sending reset email: " + error.message);
    } else {
      setMessage("A new reset link has been sent to your email. Open it and use it within a few minutes.");
    }
  };

  const handleBackToLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {message && <p className="mb-4 text-center">{message}</p>}

      {checkingSession ? (
        <p className="text-center">Loading...</p>
      ) : !linkExpired ? (
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

          <div className="w-full max-w-md mb-2">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="w-full max-w-md mb-4 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li className={password.length >= 12 ? "text-green-600" : ""}>At least 12 characters</li>
              <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>Contains an uppercase letter</li>
              <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>Contains a number</li>
              <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>Contains a symbol</li>
            </ul>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={loading || !passwordOk(password) || password !== confirmPassword}
            className="w-full max-w-md py-3 rounded-xl font-semibold bg-[var(--primary)] text-white cursor-pointer hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </>
      ) : (
        <>
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResendLink}
              className="flex-1 py-3 rounded-xl font-semibold bg-[var(--primary)] text-white cursor-pointer hover:opacity-90 transition"
            >
              Resend Reset Link
            </button>
            <button
              onClick={handleBackToLogin}
              className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
            >
              Back to Login
            </button>
          </div>
        </>
      )}
    </div>
  );
}
