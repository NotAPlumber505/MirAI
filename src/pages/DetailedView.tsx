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
    taxonomy: {
      kingdom: "Plantae",
      phylum: "Tracheophyta",
      class: "Magnoliopsida",
      order: "Rosales",
      family: "Rosaceae",
      genus: "Plantae"
    },
    confidence: "95%",
    probability: "98%",
    description: "This is a mock plant description."
  },
  imageUrl: "https://placehold.co/400x300",
};

const mockHealth = {
  is_plant: { binary: true, probability: 0.99 },
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
  health_assesment?: {
    suggestions?: Array<{
      id?: string;
      name: string;
      probability: number;
      similar_images?: SimilarImage[];
      details?: {
        description?: string;
        url?: string;
        common_names?: string[] | null;
        language?: string;
        entity_id?: string;
      };
      redundant?: boolean;
    }>;
    question?: any;
  };
  plant_information?: {
    // Taxonomy
    taxonomy?: {
      kingdom?: string;
      phylum?: string;
      class?: string;
      order?: string;
      family?: string;
      genus?: string;
    };
    // Basic info
    confidence?: string;
    probability?: string;
    description?: string;
    url?: string;
    common_names?: string[];
    // Care info
    edible_parts?: string[] | null;
    watering?: {
      min?: number;
      max?: number;
    } | null;
    propagation_methods?: string[] | null;
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
  details?: {
    description?: string;
    url?: string;
    common_names?: string[] | null;
    language?: string;
    entity_id?: string;
  };
  redundant?: boolean;
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

            // Use stored health assessment from database
            if (data.health_assesment && data.health_assesment.suggestions) {
              setHealth(data.health_assesment);
            } else {
              // No health data available
              setHealth(null);
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
        <p className="text-[var(--danger)]">{error}</p>
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
        className="max-w-3xl mx-auto text-center md:text-left text-sm md:text-base mb-3"
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        {plant.plant_information?.description || `${plant.plant_name} - No description available.`}
      </motion.p>

      {/* Wikipedia Link */}
      {plant.plant_information?.url && (
        <motion.div 
          className="max-w-3xl mx-auto text-center md:text-left mb-6"
          initial="hidden"
          animate="visible"
          variants={textVariant}
        >
          <a 
            href={plant.plant_information.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            📖 Learn more on Wikipedia →
          </a>
        </motion.div>
      )}

      {/* Common Names */}
      {plant.plant_information?.common_names && plant.plant_information.common_names.length > 0 && (
        <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🌸 Common Names</h2>
          <p className="text-sm md:text-base">{plant.plant_information.common_names.filter(n => n !== "No common names available").join(", ")}</p>
        </motion.div>
      )}

      {/* Scientific Classification */}
      {plant.plant_information?.taxonomy && (
        <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🔬 Scientific Classification</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left text-sm md:text-base">
            {plant.plant_information.taxonomy.kingdom && <p><strong>Kingdom:</strong> {plant.plant_information.taxonomy.kingdom}</p>}
            {plant.plant_information.taxonomy.phylum && <p><strong>Phylum:</strong> {plant.plant_information.taxonomy.phylum}</p>}
            {plant.plant_information.taxonomy.class && <p><strong>Class:</strong> {plant.plant_information.taxonomy.class}</p>}
            {plant.plant_information.taxonomy.order && <p><strong>Order:</strong> {plant.plant_information.taxonomy.order}</p>}
            {plant.plant_information.taxonomy.family && <p><strong>Family:</strong> {plant.plant_information.taxonomy.family}</p>}
            {plant.plant_information.taxonomy.genus && <p><strong>Genus:</strong> {plant.plant_information.taxonomy.genus}</p>}
          </div>
        </motion.div>
      )}

      {/* Care Information */}
      {(plant.plant_information?.edible_parts || plant.plant_information?.watering || plant.plant_information?.propagation_methods) && (
        <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🌿 Care Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-sm md:text-base">
            {plant.plant_information.edible_parts && plant.plant_information.edible_parts.length > 0 && (
              <p><strong>Edible Parts:</strong> {plant.plant_information.edible_parts.join(", ")}</p>
            )}
            {plant.plant_information.watering && (
              <p><strong>Watering Level:</strong> {plant.plant_information.watering.min} - {plant.plant_information.watering.max}</p>
            )}
            {plant.plant_information.propagation_methods && plant.plant_information.propagation_methods.length > 0 && (
              <p><strong>Propagation:</strong> {plant.plant_information.propagation_methods.join(", ")}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Health Assessment */}
      {health && (
        <motion.div className="max-w-4xl mx-auto mb-6" initial="hidden" animate="visible" variants={textVariant}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-center md:text-left">🩺 Health Assessment</h2>

          <p className="mb-4 text-sm md:text-base">
            <strong>Overall Health:</strong>{" "}
            <span className={health.is_healthy?.binary ? "text-[var(--success)]" : "text-[var(--secondary)]"}>
              {health.is_healthy?.binary ? "Healthy" : "Needs Attention"}
            </span>
            {health.is_healthy?.probability !== undefined && (
              <span> ({Math.round((health.is_healthy.probability || 0) * 100)}% confidence)</span>
            )}
          </p>

          {health.is_plant && (
            <p className="mb-4 text-sm md:text-base">
              <strong>Plant Probability:</strong>{" "}
              <span className={health.is_plant.binary ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                {Math.round((health.is_plant.probability || 0) * 100)}%
              </span>
              {health.is_plant.binary ? " - Confirmed as plant" : " - May not be a plant"}
            </p>
          )}

          <p className="mb-4 text-sm md:text-base">
            <strong>Last Scan:</strong> {new Date(plant.last_scan_date).toLocaleDateString()}
          </p>

          {health.question && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="font-medium mb-3">{health.question.text}</p>
              <div className="flex gap-3 mb-2">
                <button
                  onClick={() => setSelectedAnswer("yes")}
                  className={`px-4 py-2 rounded-md text-sm text-white cursor-pointer transition ${
                    selectedAnswer === "yes" ? "bg-[var(--primary)]" : "bg-[var(--primary-hover)] hover:bg-[var(--primary)]"
                  }`}
                >
                  {health.question.options.yes.translation}
                </button>
                <button
                  onClick={() => setSelectedAnswer("no")}
                  className={`px-4 py-2 rounded-md text-sm text-white cursor-pointer transition ${
                    selectedAnswer === "no" ? "bg-[var(--primary)]" : "bg-[var(--primary-hover)] hover:bg-[var(--primary)]"
                  }`}
                >
                  {health.question.options.no.translation}
                </button>
              </div>
              {selectedAnswer && (
                <p className="text-sm italic text-gray-700 dark:text-gray-300 mt-2">
                  {selectedAnswer === "yes"
                    ? "Based on your answer, water excess or uneven watering is more likely."
                    : "Based on your answer, nutrient deficiency is more likely."}
                </p>
              )}
            </div>
          )}

          {health.disease?.suggestions && health.disease.suggestions.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-4">Health Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {health.disease.suggestions
                  .filter((d) => !d.redundant) // Filter out redundant suggestions
                  .slice(0, 6) // Show top 6 suggestions
                  .map((d, idx) => (
                    <div key={d.id ?? idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      <p className="font-semibold text-lg mb-2">
                        {d.name}{" "}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          ({Math.round(d.probability * 100)}%)
                        </span>
                      </p>
                      
                      {d.details?.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {d.details.description}
                        </p>
                      )}
                      
                      {d.details?.common_names && d.details.common_names.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Also known as:</strong> {d.details.common_names.join(", ")}
                        </p>
                      )}
                      
                      {d.details?.url && (
                        <a 
                          href={d.details.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] hover:underline text-sm block mb-3"
                        >
                          Learn more →
                        </a>
                      )}
                      
                      {d.similar_images && d.similar_images.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Similar Images:</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {d.similar_images.slice(0, 3).map((img) => (
                              <img
                                key={img.id}
                                src={img.url_small || img.url}
                                alt={d.name}
                                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border flex-shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 rounded-lg bg-[var(--success)]/10 border-2 border-[var(--success)]">
              <p className="text-[var(--success)] font-semibold text-lg mb-2">
                ✅ No health issues detected!
              </p>
              <p className="text-sm">
                Your plant appears to be healthy. Continue with regular care and monitoring.
              </p>
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
