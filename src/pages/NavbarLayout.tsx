import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function NavbarLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--navbar)] transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* Render the currently selected page */}
      </main>
      <Footer /> {/* Persistent footer across pages */}
    </div>
  );
}
