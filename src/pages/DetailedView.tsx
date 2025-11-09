import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../supabaseClient";

// --- Mock plant & health data for frontend testing ---
const mockPlant = {
  id: 1,
  commonName: "Mock Plant",
  scientificName: "Plantae Mockus",
  confidence: "95%",
  classificationRank: "Species",
  probability: "98%",
  description: "This is a mock plant description.",
  kingdom: "Plantae",
  phylum: "Tracheophyta",
  class: "Magnoliopsida",
  order: "Rosales",
  family: "Rosaceae",
  genus: "Plantae",
  imageUrl: "https://placehold.co/400x300",
};

const mockHealth = {
  is_healthy: { binary: true, probability: 0.95 },
  disease: { suggestions: [] },
};

interface PlantDetails {
  id: number;
  commonName: string;
  scientificName: string;
  confidence?: string;
  classificationRank?: string;
  probability?: string;
  description: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  imageUrl: string;
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
            .from("plants")
            .select("*")
            .eq("id", plantId)
            .single();

          if (error) {
            console.error(error);
            setError("Failed to load plant.");
            setPlant(null);
          } else {
            setPlant(data);

            // Fetch health only if Plant.id key exists
            if (data.imageUrl && import.meta.env.VITE_PLANT_ID_KEY) {
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
        const response = await fetch("https://api.plant.id/v3/identify", {
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
        alt={plant.commonName}
        className="w-full max-w-xs md:max-w-sm mx-auto rounded-2xl object-cover shadow-lg mt-20 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Plant Name & Info */}
      <motion.div className="text-center mb-4" initial="hidden" animate="visible" variants={textVariant}>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{plant.commonName}</h1>
        <p className="italic text-base md:text-lg mb-1">{plant.scientificName}</p>
        <p className="text-sm md:text-base">
          Confidence: {plant.confidence} | Classification Rank: {plant.classificationRank} | Probability (Is a Plant?):{" "}
          {plant.probability}
        </p>
      </motion.div>

      {/* Description */}
      <motion.p
        className="max-w-3xl mx-auto text-center md:text-left text-sm md:text-base mb-6"
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        {plant.description}
      </motion.p>

      {/* Scientific Classification */}
      <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🔬 Scientific Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left text-sm md:text-base">
          {plant.kingdom && <p><strong>Kingdom:</strong> {plant.kingdom}</p>}
          {plant.phylum && <p><strong>Phylum:</strong> {plant.phylum}</p>}
          {plant.class && <p><strong>Class:</strong> {plant.class}</p>}
          {plant.order && <p><strong>Order:</strong> {plant.order}</p>}
          {plant.family && <p><strong>Family:</strong> {plant.family}</p>}
          {plant.genus && <p><strong>Genus:</strong> {plant.genus}</p>}
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
