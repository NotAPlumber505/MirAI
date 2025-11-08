import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Grid, Columns } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Plant {
  id: number;
  name: string;
  scientificName: string;
  species: string;
  overallHealth: string;
  lastScan: string;
  imageUrl: string;
}

export default function MyGarden(props: any) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
    const supabase = props.supabase;
    useEffect(() => {
        if(!props.isLoggedIn){
        const kickIfnotLogged = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!(data.session === null))
                navigate("/login")
        }
        kickIfnotLogged;
        //Implement solver if supabase is null

        }
        },[props.isLoggedIn])

  // Mock plant data
  const [plants] = useState<Plant[]>([
    {
      id: 1,
      name: "Plant One",
      scientificName: "Plantae Unus",
      species: "Species A",
      overallHealth: "Good",
      lastScan: "2025-11-08",
      imageUrl: "https://placehold.co/150x150",
    },
    {
      id: 2,
      name: "Plant Two",
      scientificName: "Plantae Duo",
      species: "Species B",
      overallHealth: "Average",
      lastScan: "2025-11-07",
      imageUrl: "https://placehold.co/150x150",
    },
    {
      id: 3,
      name: "Plant Three",
      scientificName: "Plantae Tres",
      species: "Species C",
      overallHealth: "Excellent",
      lastScan: "2025-11-06",
      imageUrl: "https://placehold.co/150x150",
    },
  ]);

  const [layout, setLayout] = useState<"grid" | "column">("grid");

  return (
    <div
      className={`min-h-screen px-4 py-6 md:px-12 transition-colors duration-500 ${
        darkMode ? "bg-[var(--background)] text-white" : "bg-[var(--background)] text-[var(--navbar)]"
      }`}
    >
      {/* Page Header */}
      <h1 className="text-4xl md:text-5xl font-bold mt-30 mb-15 font-[var(--font-logo)] text-center">
        My Garden
      </h1>

      {/* Layout toggle (desktop only) */}
      <div className="hidden md:flex justify-center gap-4 mb-6">
        <button
          onClick={() => setLayout("grid")}
          className={`p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer ${
            layout === "grid"
              ? "bg-[var(--primary)] text-white"
              : darkMode
              ? "bg-[var(--navbar)] text-[var(--background)]"
              : "bg-white text-[var(--primary)]"
          }`}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setLayout("column")}
          className={`p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer ${
            layout === "column"
              ? "bg-[var(--primary)] text-white"
              : darkMode
              ? "bg-[var(--navbar)] text-[var(--background)]"
              : "bg-white text-[var(--primary)]"
          }`}
        >
          <Columns size={20} />
        </button>
      </div>
        {/* Plants Grid */}
        <div
        className={`${
            layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-6 w-full"
        }`}
        >
        {plants.map((plant) => (
            <motion.div
            key={plant.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`shadow-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                layout === "grid"
                ? "flex flex-col w-full rounded-[30px] bg-[var(--navbar)]" // fully rounded, grid
                : "flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-3xl bg-[var(--navbar)]" // column
            }`}
            onClick={() => navigate(`/my-garden/${plant.id}`)}
            >
            {/* Image */}
            <div
                className={`${
                layout === "grid"
                    ? "w-full h-48"
                    : "w-full md:w-1/4 h-48 md:h-auto flex-shrink-0"
                }`}
            >
                <img
                src={plant.imageUrl}
                alt={plant.name}
                className="object-cover w-full h-full"
                />
            </div>

            {/* Text */}
            <div
                className={`flex flex-col p-4 md:p-6 space-y-2 text-left ${
                layout === "column" ? "w-full md:w-3/4" : ""
                }`}
            >
                <p
                className={`font-bold text-lg md:text-xl ${
                    layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                {plant.name}
                </p>
                <p
                className={`text-sm md:text-base ${
                    layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Scientific Name: {plant.scientificName}
                </p>
                <p
                className={`text-sm md:text-base ${
                    layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Species: {plant.species}
                </p>
                <p
                className={`text-sm md:text-base ${
                    layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Overall Health: {plant.overallHealth}
                </p>
                <p
                className={`text-sm md:text-base ${
                    layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Last Scan: {plant.lastScan}
                </p>
            </div>
            </motion.div>
        ))}
        </div>

      {/* Mobile-only footer */}
      <footer className="mt-30 mb-10 text-sm block md:hidden text-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
