import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile.tsx"
import Login from "./pages/Login.tsx"
import Signup from "./pages/Signup.tsx"
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path= "/" element={<Navbar />}>
          {/*/ Include pages that should include the navbar in here/*/}
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>

      </Routes>
    </Router>
  );
}
