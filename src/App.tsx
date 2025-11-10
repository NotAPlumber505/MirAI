import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
            path="/home"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
          />
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

        {/* Auth routes - standalone without navbar */}
        <Route
          path="/login"
          element={<Login supabase={supabase} />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword supabase={supabase} />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}
