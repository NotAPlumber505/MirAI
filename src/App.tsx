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
import { supabase } from "./supabaseClient";

export default function App() {
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

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Wait until login status is known
  if (isLoggedIn === null) return null;

  return (
    <Router>
      <Routes>
        {/* Pages with navbar and footer */}
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
          <Route path="/my-garden/:id" element={isLoggedIn ? <DetailedView /> : <Navigate to="/login" replace />} />
          <Route
            path="/profile"
            element={isLoggedIn ? <Profile supabase={supabase} /> : <Navigate to="/login" replace />}
          />
          <Route path="/team" element={<Team />} />
        </Route>

        {/* Pages without navbar/footer */}
        <Route path="/login" element={!isLoggedIn ? <Login supabase={supabase} /> : <Navigate to="/" replace />} />
        <Route
          path="/forgot-password"
          element={!isLoggedIn ? <ForgotPassword supabase={supabase} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}
