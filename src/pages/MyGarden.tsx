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
        if(!props.isLoggedIn){
        const kickIfnotLogged = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!(data.session === null))
                navigate("/login")
        }
        kickIfnotLogged;
        //Implement solver if supabase is null
        }
        retreievePlants();
      },[location.pathname])

  // Mock plant data
  const [plants, setPlants] = useState<Plant[]>([
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
          <PlantDisplay layout={layout} plants={plants}/>
        </div>

      {/* Mobile-only footer */}
      <footer className="mt-30 mb-10 text-sm block md:hidden text-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
  async function retreievePlants() {
    const { data, error } = await supabase
    .from("usersplants")
    .select('plant_path, plant_name, scientific_name, species, overall_health,last_scan_date,id ')
    if(error){
      console.log("Unfortunate. Plant not found: " + error)
      return;
    }
    let plants: Plant[] = []
    await Promise.all( data.map(async (plant :any) => {
      const { data, error } = await supabase
    .storage
    .from("plant_images")
    .createSignedUrl(plant.plant_path,60)
    if(error) {
      console.log("Error retrieving image: " + error);
    }
      const plant_image = data.signedUrl;
      const parsedPlant: Plant = {
        id: plant.id,
        name: plant.plant_name,
        scientificName: plant.scientific_name,
        species: plant.species,
        overallHealth: plant.overall_health,
        lastScan: plant.last_scan_date,
        imageUrl: plant_image
      }
      plants.push(parsedPlant)
      return plants;
    })
  )
  setPlants(plants)
  }
}
