import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../supabaseClient";

// --- Mock plant & health data for frontend testing ---
const mockPlant: PlantDetails = {
  id: 1,
  user_id: "00000000-0000-0000-0000-000000000000",
  plant_path: "mock/plant.jpg",
  plant_name: "Mock Plant",
  scientific_name: "Plantae Mockus",
  species: "Mock Species",
  overall_health: "Good",
  last_scan_date: "2025-11-09",
  plant_information: {
    kingdom: "Plantae",
    phylum: "Tracheophyta",
    class: "Magnoliopsida",
    order: "Rosales",
    family: "Rosaceae",
    genus: "Plantae",
    confidence: "95%",
    probability: "98%",
    description: { value: "This is a mock plant description." }
  },
  imageUrl: "https://placehold.co/400x300",
};

const mockHealth = {
  is_healthy: { binary: true, probability: 0.95 },
  disease: { suggestions: [] },
};

interface PlantDetails {
  id: number;
  user_id: string;
  plant_path: string;
  plant_name: string;
  avatar?: string;
  scientific_name: string;
  species: string;
  overall_health: string;
  last_scan_date: string;
  health_assesment?: any;
  plant_information?: {
    kingdom?: string;
    phylum?: string;
    class?: string;
    order?: string;
    family?: string;
    genus?: string;
    confidence?: string;
    probability?: string;
    description?: {
      value: string;
    };
  };
  imageUrl?: string; // This will be generated from plant_path
}

interface SimilarImage {
  id?: string;
  url?: string;
  url_small?: string;
  license_name?: string;
  citation?: string;
  similarity?: number;
}

interface DiseaseSuggestion {
  id?: string;
  name: string;
  probability: number;
  similar_images?: SimilarImage[];
  details?: { language?: string; entity_id?: string };
}

interface HealthResult {
  is_plant?: { probability?: number; threshold?: number; binary?: boolean };
  is_healthy?: { binary?: boolean; threshold?: number; probability?: number };
  disease?: { suggestions?: DiseaseSuggestion[] };
  question?: any;
}

export default function DetailedView() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [plant, setPlant] = useState<PlantDetails | null>(null);
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"yes" | "no" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const plantId = Number(id);

    async function fetchPlant() {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          // No Supabase key: fallback to mock
          setPlant(mockPlant);
          setHealth(mockHealth);
        } else {
          const { data, error } = await supabase
            .from("usersplants")
            .select("*")
            .eq("id", plantId)
            .single();

          if (error) {
            console.error(error);
            setError("Failed to load plant.");
            setPlant(null);
          } else if (data) {
            // Get signed URL for the plant image
            const { data: imageData, error: imageError } = await supabase
              .storage
              .from("plant_images")
              .createSignedUrl(data.plant_path, 60);

            if (imageError) {
              console.error("Error getting image URL:", imageError);
              data.imageUrl = "https://placehold.co/400x300"; // Fallback image
            } else {
              data.imageUrl = imageData.signedUrl;
            }

            setPlant(data);

            // Use stored health assessment if available, otherwise try Plant.id API
            if (data.health_assesment) {
              setHealth(data.health_assesment);
            } else if (data.imageUrl && import.meta.env.VITE_PLANT_ID_KEY) {
              fetchHealth(data.imageUrl);
            } else {
              setHealth(mockHealth);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchHealth(imageUrl: string) {
      try {
        const response = await fetch("https://api.plant.id/v3/health_assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": import.meta.env.VITE_PLANT_ID_KEY!,
          },
          body: JSON.stringify({
            images: [imageUrl],
            organ: "leaf",
            disease_details: true,
          }),
        });

        const data = await response.json();
        setHealth(data);
      } catch (err) {
        console.error(err);
        setHealth(mockHealth); // fallback
      }
    }

    fetchPlant();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"}`}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"}`}>Plant not found.</p>
      </div>
    );
  }

  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}
      className={`min-h-screen px-4 py-6 md:px-12 transition-colors duration-500 ${
        darkMode ? "bg-[var(--background)] text-white" : "bg-[var(--background)] text-[var(--navbar)]"
      }`}
    >
      {/* Plant Image */}
      <motion.img
        src={plant.imageUrl}
        alt={plant.plant_name}
        className="w-full max-w-xs md:max-w-sm mx-auto rounded-2xl object-cover shadow-lg mt-20 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Plant Name & Info */}
      <motion.div className="text-center mb-4" initial="hidden" animate="visible" variants={textVariant}>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{plant.plant_name}</h1>
        <p className="italic text-base md:text-lg mb-1">{plant.scientific_name}</p>
        <p className="text-sm md:text-base">
          Probability (Is a Plant?):{" "}
          {plant.plant_information?.probability}
        </p>
      </motion.div>

      {/* Description */}
      <motion.p
        className="max-w-3xl mx-auto text-center md:text-left text-sm md:text-base mb-6"
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        {plant.plant_information?.description?.value}
      </motion.p>

      {/* Scientific Classification */}
      <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🔬 Scientific Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left text-sm md:text-base">
          {plant.plant_information?.kingdom && <p><strong>Kingdom:</strong> {plant.plant_information?.kingdom}</p>}
          {plant.plant_information?.phylum && <p><strong>Phylum:</strong> {plant.plant_information?.phylum}</p>}
          {plant.plant_information?.class && <p><strong>Class:</strong> {plant.plant_information?.class}</p>}
          {plant.plant_information?.order && <p><strong>Order:</strong> {plant.plant_information?.order}</p>}
          {plant.plant_information?.family && <p><strong>Family:</strong> {plant.plant_information?.family}</p>}
          {plant.plant_information?.genus && <p><strong>Genus:</strong> {plant.plant_information?.genus}</p>}
        </div>
      </motion.div>

      {/* Health Assessment */}
      {health && (
        <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🩺 Health Assessment</h2>

          <p className="mb-2 text-sm md:text-base">
            Overall Health: {health.is_healthy?.binary ? "Healthy" : "Unhealthy"}{" "}
            {health.is_healthy?.probability !== undefined && (
              <span>({Math.round((health.is_healthy.probability || 0) * 100)}%)</span>
            )}
          </p>

          {health.question && (
            <div className="mb-4">
              <p className="font-medium mb-2">{health.question.text}</p>
              <div className="flex gap-3 mb-2">
                <button
                  onClick={() => setSelectedAnswer("yes")}
                  className={`px-4 py-2 rounded-md text-sm text-white cursor-pointer ${
                    selectedAnswer === "yes" ? "bg-[var(--primary)]" : "bg-[var(--primary-hover)]"
                  }`}
                >
                  {health.question.options.yes.translation}
                </button>
                <button
                  onClick={() => setSelectedAnswer("no")}
                  className={`px-4 py-2 rounded-md text-sm text-white cursor-pointer ${
                    selectedAnswer === "no" ? "bg-[var(--primary)]" : "bg-[var(--primary-hover)]"
                  }`}
                >
                  {health.question.options.no.translation}
                </button>
              </div>
              {selectedAnswer && (
                <p className="text-sm italic text-[var(--navbar)]">
                  {selectedAnswer === "yes"
                    ? "Based on your answer, water excess or uneven watering is more likely."
                    : "Based on your answer, nutrient deficiency is more likely."}
                </p>
              )}
            </div>
          )}

          {health.disease?.suggestions && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-3">Diseases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {health.disease.suggestions.map((d, idx) => (
                  <div key={d.id ?? idx} className="border rounded-lg p-3 flex flex-col items-center">
                    <p className="font-semibold text-lg mb-1">{d.name} ({Math.round(d.probability * 100)}%)</p>
                    <p className="text-sm mb-2 text-gray-600">Cause: {d.name}</p>
                    <div className="flex gap-2 overflow-x-auto w-full p-1">
                      {d.similar_images?.map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={d.name}
                          className="w-32 h-32 md:w-40 md:h-40 object-contain rounded border flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Back Button */}
      <motion.div className="text-center mb-8" initial="hidden" animate="visible" variants={textVariant}>
        <button
          onClick={() => navigate("/my-garden")}
          className="px-6 py-3 rounded-lg bg-[var(--primary)] hover:bg-green-600 text-white font-semibold transition cursor-pointer"
        >
          Back to My Garden
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="mt-6 text-sm text-center block md:hidden">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
}
