import Navbar from "../components/Navbar.tsx"
import { Outlet } from "react-router-dom"
export default function NavbarLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--navbar)] transition-colors duration-300">
            <Navbar />
            <Outlet />
        </div>
    );
}