import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import Footer from "../components/Footer";

export default function NavbarLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar for desktop */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 pb-28 md:pb-0"> 
        <Outlet />
      </main>

      {/* Footer (desktop only) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Navbar — visible on all main pages */}
      <div className="block md:hidden">
        <MobileNavbar />
      </div>
    </div>
  );
}
