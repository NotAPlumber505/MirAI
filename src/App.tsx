import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarLayout from "./pages/NavbarLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";
import MyPlants from "./pages/MyPlants";
import Login from "./pages/Login";
import Team from "./pages/Team";
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_KEY)

export default function App() {


  const [isLoggedIn,setIsLoggedIn] = useState(false)

   supabase.auth.onAuthStateChange((event, session) => {
      checkLogin();
   });

  return (
    <Router>
      <Routes>
        {/* Pages with navbar and footer */}
        <Route element={<NavbarLayout isLoggedIn={isLoggedIn} />}>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan  supabase={supabase} />} />
          <Route path="/my-plants" element={<MyPlants supabase={supabase} />} />
          <Route path="/profile" element={<Profile supabase={supabase}/>} />
          <Route path="/team" element={<Team />} />
        </Route>

        {/* Pages without navbar/footer (auth) */}
        <Route path="/login" element={<Login supabase={supabase} />} />
      </Routes>
    </Router>
  );

  //Database functions
  async function checkLogin() {
    const { data, error } = await supabase.auth.getSession();
    if(error)
      console.log("Supabase Error:" + error);
    else 
      setIsLoggedIn(!(data.session === null));
  }
  
}
