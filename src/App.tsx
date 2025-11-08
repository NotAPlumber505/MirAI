import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path= "/" element={<Navbar />}>
          {/*/ Include pages that should include the navbar in here/*/}
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
