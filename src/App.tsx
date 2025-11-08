import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarLayout from "./pages/NavbarLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";
import MyPlants from "./pages/MyPlants";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* All pages with Navbar */}
        <Route element={<NavbarLayout />}>
          <Route index element={<Home />} />
          <Route path="scan" element={<Scan />} />
          <Route path="my-plants" element={<MyPlants />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Pages without Navbar */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
