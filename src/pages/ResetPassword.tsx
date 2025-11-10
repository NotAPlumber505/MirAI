import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [wasAlreadyLoggedIn, setWasAlreadyLoggedIn] = useState(false);

  const passwordOk = (pwd: string) =>
    pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

  useEffect(() => {
    const initializeSession = async () => {
      // First, check if user is already logged in (change password from profile)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && !window.location.hash.includes('access_token')) {
        // User is already logged in and not coming from email link
        setWasAlreadyLoggedIn(true);
        setIsValidSession(true);
        setCheckingSession(false);
        setMessage('Please enter your new password below.');
        return;
      }

      // If there's no session yet, wait for PASSWORD_RECOVERY event
      setCheckingSession(false);
      if (!session) {
        setMessage('Loading password reset...');
      }
    };

    initializeSession();

    // Listen for PASSWORD_RECOVERY event when user clicks email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected');
        setIsValidSession(true);
        setWasAlreadyLoggedIn(false);
        setMessage('Please enter your new password below.');
      } else if (event === 'SIGNED_IN' && session) {
        // Check if this is a recovery session
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        if (type === 'recovery') {
          setIsValidSession(true);
          setWasAlreadyLoggedIn(false);
          setMessage('Please enter your new password below.');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async () => {
    if (!password || !passwordOk(password) || password !== confirmPassword) {
      setMessage("Please check your password requirements.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setMessage("Password updated successfully! Redirecting...");
      
      // If user was already logged in, go back to profile, otherwise go to login
      setTimeout(() => {
        if (wasAlreadyLoggedIn) {
          navigate("/profile");
        } else {
          navigate("/login");
        }
      }, 2500);
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${darkMode ? "bg-[var(--background)]" : "bg-[var(--background)]"}`}>
      <div className={`w-full max-w-md shadow-lg rounded-2xl p-8 ${darkMode ? "bg-[var(--navbar)] text-white" : "bg-white text-[var(--navbar)]"}`}>
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--primary)]">Reset Password</h1>
        {message && <p className="mb-4 text-center">{message}</p>}
        {checkingSession ? <p>Loading...</p> : isValidSession ? (
          <>
            <div className="relative mb-4">
              <label className="block mb-2 text-sm font-semibold">New Password</label>
              <input type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border" />
              <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-3 top-[70%] transform -translate-y-1/2">
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border" />
            </div>
            <button onClick={handleResetPassword} disabled={loading} className={`w-full py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 ${
              darkMode 
                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95' 
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
            <button onClick={() => navigate("/login")} className={`w-full mt-3 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
              darkMode
                ? 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95'
                : 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95'
            }`}>Back to Login</button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/forgot-password")} className={`w-full py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 ${
              darkMode
                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95'
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95'
            }`}>Request New Link</button>
            <button onClick={() => navigate("/login")} className={`w-full py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
              darkMode
                ? 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95'
                : 'text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95'
            }`}>Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}
