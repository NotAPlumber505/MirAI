import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface PlantIdResponse {
  result: {
    classification: {
      suggestions: Array<{
        name: string;
        probability: number;
        similar_images: Array<{
          id: string;
          url: string;
          license_name: string;
          citation: string;
        }>;
        details: {
          common_names?: string[];
          taxonomy: {
            class: string;
            family: string;
            genus: string;
            kingdom: string;
            order: string;
            phylum: string;
          };
          description?: string;
          url?: string;
        };
      }>;
    };
    disease: {
      question: string;
      suggestions: [{
      }]
    }
    is_healthy: { binary: boolean; probability: number };
  };
};

export default function Scan(props: any) {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plantData, setPlantData] = useState<PlantIdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const supabase = props.supabase;
  const location = useLocation();

  //Redirect if not logged in
  useEffect(() => {
    if (!props.isLoggedIn) {
      const kickIfnotLogged = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) navigate("/login");
      };
      kickIfnotLogged();
    }
  }, [location.pathname]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));

      try {
        // First identify the plant
        const base64Image = await fileToBase64(file);
        const identificationResult = await identifyPlant(base64Image);
        setPlantData(identificationResult);
        
        // Then upload to storage and database
        const filePath = await uploadFileToBucket(file);
        if (filePath === null) {
          throw new Error("Failed to upload file to storage");
        }
        
        // Insert all data into the database
        await insertIntoUsersPlantsTable(filePath, identificationResult);
      } catch (err) {
        console.error("Error processing plant:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        resolve(base64String.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const identifyPlant = async (base64Image: string): Promise<any> => {
  const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
  if (!apiKey) throw new Error("Plant.ID API key not configured");

  const detailsList = [
    "common_names",
    "url",
    "description",
    "taxonomy",
    "rank",
    "gbif_id",
    "inaturalist_id",
    "image",
    "synonyms",
    "edible_parts",
    "watering",
    "best_light_condition",
    "best_soil_type",
    "common_uses",
    "cultural_significance",
    "toxicity",
    "best_watering"
  ];

  const language = "en";

  const url = `https://api.plant.id/v3/identification?details=${detailsList.join(",")}&language=${language}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({
      images: [base64Image],
      classification_level: "species",
      similar_images: true,
      health: "all"
    }),
  });

  if (!response.ok) {
    throw new Error(`Identification failed: ${response.status}`);
  }

  const identification = await response.json();

  // Now the response should already include full taxonomy + other details
  console.log(identification)
  return identification;
};



  const handleUploadClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewURL(null);
  };

  // Framer Motion text animation variant
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-center transition-colors duration-500 px-4
        ${darkMode ? "bg-[var(--background)] text-white" : "bg-[var(--background)] text-[var(--navbar)]"}
      `}
    >
      {!selectedFile ? (
        <>
          {/* Title */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold mt-40 mb-30 font-[var(--font-logo)]"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Upload a photo of your plant 🌱✨
          </motion.h1>

          {/* Upload Area */}
          <motion.div
            className={`w-80 h-80 mb-50 md:w-[24rem] md:h-[24rem] flex flex-col items-center justify-center rounded-[50px] cursor-pointer shadow-lg transition-all duration-300
              ${darkMode ? "bg-[var(--navbar)] text-[var(--background)]" : "bg-[var(--navbar)] text-white"}
              hover:scale-105 active:scale-95
            `}
            onClick={handleUploadClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } }}
          >
            <Upload className="w-16 h-16 mb-10" />
            <span className="text-2xl font-semibold">Upload Picture</span>
          </motion.div>

          {/* Hidden File Input */}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Mobile-only footer */}
          <footer className="mt-20 mb-10 text-sm block md:hidden">
            <p
              className={`${
                darkMode ? "text-white" : "text-[var(--navbar)]"
              } transition-colors duration-300`}
            >
              © 2025 MirAI. All rights reserved.
            </p>
          </footer>
        </>
      ) : (
        <>
          {/* Plant Identified Section */}
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mt-10 md:mt-40 mb-6 transition-colors duration-300 ${
              darkMode ? "text-[var(--navbar)]" : "text-[var(--primary)]"
            }`}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Plant Identified!
          </motion.h2>

          {/* Image Preview */}
          {previewURL && (
            <motion.div
              className="w-full max-w-md mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
            >
              <img
                src={previewURL}
                alt="Uploaded Plant"
                className="w-full h-auto rounded-3xl shadow-xl object-contain transition-all duration-300"
              />
            </motion.div>
          )}

          {/* Plant Info Fields */}
          <motion.div
            className="text-left w-full max-w-md space-y-2 md:space-y-3 text-base md:text-lg"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            {isLoading ? (
              <div className="text-center text-[var(--primary)]">
                <p>Identifying plant...</p>
                <div className="mt-4 h-2 bg-[var(--primary-hover)] rounded-full animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)]"
                >
                  Try Again
                </button>
              </div>
            ) : plantData ? (
              <>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Name:</span>{" "}
                  {plantData.result.classification.suggestions[0].name}
                </p>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Species:</span>{" "}
                  {plantData.result.classification.suggestions[0].details.taxonomy.genus +
                    " " +
                    plantData.result.classification.suggestions[0].name.split(" ").slice(-1)[0]}
                </p>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Common Names:</span>{" "}
                  {plantData.result.classification.suggestions[0].details.common_names?.join(", ") || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Family/Genus:</span>{" "}
                  {plantData.result.classification.suggestions[0].details.taxonomy.family} /{" "}
                  {plantData.result.classification.suggestions[0].details.taxonomy.genus}
                </p>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Overall Health:</span>{" "}
                  {plantData.result?.is_healthy.binary ? "Healthy" : "Needs Attention"}
                  {plantData.result?.is_healthy.probability && 
                    ` (${(plantData.result.is_healthy.probability * 100).toFixed(1)}%)`}
                </p>
                <p>
                  <span className="font-semibold text-[var(--primary)]">Scan Date:</span>{" "}
                  {new Date().toLocaleDateString()}
                </p>
                {plantData.result?.disease.length ? (
                  <div className="mt-4">
                    <p className="font-semibold text-[var(--primary)]">Health Issues:</p>
                    <ul className="list-disc pl-5 mt-2">
                      {plantData.result.disease.map((disease : any, idx : any) => (
                        <li key={idx}>
                          {disease.name} ({(disease.probability * 100).toFixed(1)}%)
                          {disease.description && <p className="text-sm mt-1">{disease.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </motion.div>

          {/* Upload Another Button */}
          <motion.button
            onClick={handleReset}
            className={`mt-10 mb-4 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
              ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            Upload another?
          </motion.button>

          {/* View in My Plants Button */}
          <motion.button
            onClick={() => navigate("/my-garden")}
            className={`mt-4 mb-40 w-100 h-20 rounded-full text-xl font-medium shadow-md transition-all duration-300 cursor-pointer
            ${darkMode
              ? "bg-[var(--primary-hover)] text-[var(--background)] hover:bg-[var(--primary)]"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }
            hover:scale-105
            active:scale-95
          `}
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            View in My Plants
          </motion.button>

          {/* Mobile-only footer */}
          <footer className="mt-16 mb-10 text-sm block md:hidden">
            <p
              className={`${
                darkMode ? "text-white" : "text-[var(--navbar)]"
              } transition-colors duration-300`}
            >
              © 2025 MirAI. All rights reserved.
            </p>
          </footer>
        </>
      )}
    </div>
  );

  //Database functions
  async function uploadFileToDatabase(file: File, identificationResult: PlantIdResponse) {
    try {
      const filePath = await uploadFileToBucket(file);
      if (filePath === null) {
        throw new Error("Failed to upload file to storage");
      }
      await insertIntoUsersPlantsTable(filePath, identificationResult);
      console.log("Successfully saved plant data!");
    } catch (err) {
      console.error("Error in uploadFileToDatabase:", err);
      throw err;
    }
  }

    async function getUserID() {
        const { data: { user }} = await supabase.auth.getUser()
        if (user) 
            return user.id
        else{
            console.log("Failed to get user's ID!")
            return;
        }
    }
    async function uploadFileToBucket(file:any) {
        const plantID = await getLastPlantId();
        const userID = await getUserID();
        const filePath = `${userID}/plant${plantID}.png`
        console.log(userID);
        const { data, error } = await supabase
        .storage
        .from('plant_images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })
        if(error) {
            console.log("Error uploading image! Error: " + error);
            return null;
        }
        else {
            console.log("Uploaded file!");
        }
        return filePath;
    }

    async function insertIntoUsersPlantsTable(filePath: string, plantData: PlantIdResponse) {
      // Get the best match from suggestions
      console.log(plantData)
      const bestMatch = plantData.result.classification.suggestions[0];
      const health = plantData.result.disease;
      const plantInfo = {
        plant_path: filePath,
        plant_name: bestMatch.name,
        scientific_name: bestMatch.name,
        species: bestMatch.details.taxonomy.genus + " " + bestMatch.name.split(" ").slice(-1)[0],
        overall_health: plantData.result.is_healthy.binary ? "Healthy" : "Needs Attention",
        last_scan_date: new Date().toISOString(),
        health_assesment: health,
        plant_information: {
          kingdom: bestMatch.details.taxonomy.kingdom,
          phylum: bestMatch.details.taxonomy.phylum,
          class: bestMatch.details.taxonomy.class,
          order: bestMatch.details.taxonomy.order,
          family: bestMatch.details.taxonomy.family,
          genus: bestMatch.details.taxonomy.genus,
          confidence: (bestMatch.probability * 100).toFixed(1) + "%",
          probability: (bestMatch.probability * 100).toFixed(1) + "%",
          description: bestMatch.details.description || "No description available"
        }
      };

      const { error } = await supabase
        .from("usersplants")
        .insert(plantInfo);

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error("Failed to save plant data");
      }
    }
    async function getLastPlantId() {
      const { data, error} = await supabase.rpc("plant_sequence_value")
      if(error) {
        console.log("Error fetching plant id!: " + error + "/nKicking back to homepage!");
        navigate("/");
      }
      return data;
    }
}
