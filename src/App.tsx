import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavbarLayout from "./pages/NavbarLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";
import MyGarden from "./pages/MyGarden";
import DetailedView from "./pages/DetailedView";
import Login from "./pages/Login";
import Team from "./pages/Team";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./supabaseClient";

// Wrapper to handle rendering ResetPassword even if logged in
function ResetPasswordWrapper({ isLoggedIn }: { isLoggedIn: boolean }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const hasHashToken = typeof window !== 'undefined' && (window.location.hash?.includes('access_token=') || location.hash?.includes('access_token='));
  const hasRecoveryFlag = searchParams.get('recovery') === '1' || !!searchParams.get('email');

  // If a token, hash access_token, or recovery flag exists, always render ResetPassword
  if (token || hasHashToken || hasRecoveryFlag) return <ResetPassword />;

  // Otherwise, only render if not logged in
  return !isLoggedIn ? <ResetPassword /> : <Navigate to="/" replace />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkLogin() {
      const { data, error } = await supabase.auth.getSession();
      setIsLoggedIn(!error && !!data.session);
    }
    checkLogin();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Router>
      <Routes>
        <Route element={<NavbarLayout isLoggedIn={isLoggedIn} />}>
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
          <Route
            path="/scan"
            element={isLoggedIn ? <Scan supabase={supabase} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-garden"
            element={isLoggedIn ? <MyGarden supabase={supabase} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-garden/:id"
            element={isLoggedIn ? <DetailedView /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <Profile supabase={supabase} /> : <Navigate to="/login" replace />}
          />
          <Route path="/team" element={<Team />} />
        </Route>

        {/* Auth routes */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login supabase={supabase} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/forgot-password"
          element={!isLoggedIn ? <ForgotPassword supabase={supabase} /> : <Navigate to="/" replace />}
        />
        <Route path="/reset-password" element={<ResetPasswordWrapper isLoggedIn={!!isLoggedIn} />} />
      </Routes>
    </Router>
  );
}
