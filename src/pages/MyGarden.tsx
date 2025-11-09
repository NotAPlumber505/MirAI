import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Grid, Columns } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import PlantDisplay from "../components/PlantDisplay.tsx";
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
  const location = useLocation();
  const supabase = props.supabase;

  useEffect(() => {
    // Ensure user is logged in and then fetch plants
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          navigate('/login');
          return;
        }

        await retrievePlants();
      } catch (err) {
        console.error('Error checking session or retrieving plants:', err);
        setPlants([]);
      }
    };

    init();
  }, [location.pathname, props.isLoggedIn]);

  // Plants list (start empty and populate from Supabase)
  const [plants, setPlants] = useState<Plant[]>([]);

  const [layout, setLayout] = useState<"grid" | "column">("grid");

  // Framer Motion text animation variant
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Container class: when no plants, use a centered flex container so the empty-state is centered
  const containerClass =
    plants.length === 0
      ? "w-full flex items-center justify-center text-center px-6 md:px-16 min-h-[60vh]"
      : layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col gap-6 w-full";

  return (
    <div
      className={`min-h-screen px-4 py-6 md:px-12 transition-colors duration-500 ${
        darkMode ? "bg-[var(--background)] text-white" : "bg-[var(--background)] text-[var(--navbar)]"
      }`}
    >
      {/* Page Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold mt-30 mb-15 font-[var(--font-logo)] text-center"
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        My Garden
      </motion.h1>

      {/* Layout toggle (desktop only) - only show when there are plants */}
      {plants.length > 0 && (
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
      )}

      {/* Plants Grid */}
      <div className={`${containerClass}`}>
          {plants.length === 0 ? (
            <div className="relative w-full flex flex-col justify-center items-center text-center px-6 md:px-16 flex-1 py-12">
              <div className="flex flex-col justify-center items-center">
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>
                  You don’t have any plants yet! 🌱
                </h2>
                <p className="text-lg mb-6">Scan a plant to start your garden and keep track of your plants' health.</p>
                <button
                  onClick={() => navigate('/scan')}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer ${darkMode ? 'bg-[var(--primary)] hover:bg-green-700 text-white' : 'bg-[var(--primary)] hover:bg-green-600 text-white'}`}>
                  Go to Scan Page
                </button>
              </div>
            </div>
          ) : (
            <PlantDisplay layout={layout} plants={plants} />
          )}
        </div>

      {/* Mobile-only footer */}
      <footer className="mt-30 mb-10 text-sm block md:hidden text-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
  async function retrievePlants() {
    try {
      const { data, error } = await supabase
        .from("usersplants")
        .select('plant_path, plant_name, scientific_name, species, overall_health,last_scan_date,id');

      if (error || !data || data.length === 0) {
        if (error) console.log("Error fetching plants:", error);
        setPlants([]);
        return;
      }

      const plantsList: Plant[] = await Promise.all(
        data.map(async (plant: any) => {
          let plant_image = "https://placehold.co/150x150";
          try {
            if (plant.plant_path) {
              const { data: imageData, error: imageError } = await supabase
                .storage
                .from("plant_images")
                .createSignedUrl(plant.plant_path, 60);

              if (!imageError && imageData?.signedUrl) {
                plant_image = imageData.signedUrl;
              }
            }
          } catch (imgErr) {
            console.log("Error retrieving image:", imgErr);
          }

          const parsedPlant: Plant = {
            id: plant.id,
            name: plant.plant_name,
            scientificName: plant.scientific_name,
            species: plant.species,
            overallHealth: plant.overall_health,
            lastScan: plant.last_scan_date,
            imageUrl: plant_image,
          };

          return parsedPlant;
        })
      );

      setPlants(plantsList);
    } catch (err) {
      console.error("Unexpected error retrieving plants:", err);
      setPlants([]);
    }
  }
}
