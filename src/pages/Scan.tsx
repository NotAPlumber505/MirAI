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
      question?: string;
      suggestions: Array<any>;
    };
    is_healthy?: { binary: boolean; probability: number };
    is_plant?: { binary: boolean; probability: number; threshold?: number };
    question?: any;
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
        // Keep the full data URL (e.g. "data:image/jpeg;base64,...").
        // Plant.id has been observed to accept the data URL form reliably —
        // sending the full data URL preserves the MIME type and avoids 400/non-JSON responses.
        resolve(base64String);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Call the backend proxy (server) instead of calling Plant.id directly from the client.
  // This keeps the Plant.id API key on the server and avoids exposing it in client bundles.
  const identifyPlant = async (base64Image: string): Promise<any> => {
    // First, get plant identification
    // Only send parameters that Plant.id accepts as "modifiers" in the POST body
    const identifyBody = {
      images: [base64Image],
      classification_level: "species",
      similar_images: true
    };

    // Allow an explicit dev backend override via Vite env var VITE_API_BASE_URL.
    // If set, we'll call the backend directly (useful when the Vite proxy isn't forwarding POSTs).
      const devBase = ((import.meta as any).env?.VITE_API_BASE_URL) || '';
    const identifyPath = devBase ? `${devBase.replace(/\/$/, '')}/identify` : '/api/identify';

    // Try proxy/base path first. If that returns 404 and we didn't already target the backend directly,
    // fall back to the backend at http://localhost:5000/identify for local testing.
    let identifyResp = await fetch(identifyPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identifyBody),
    }).catch((e) => {
      console.warn('Proxy request to /api/identify failed:', e);
      return null;
    });

    if (!devBase && identifyResp && identifyResp.status === 404) {
      // Vite dev server didn't proxy the request. Try the backend directly.
      console.warn('/api/identify returned 404 from dev server — trying backend at http://localhost:5000/identify');
      identifyResp = await fetch('http://localhost:5000/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identifyBody),
      }).catch((e) => {
        console.error('Direct backend request failed:', e);
        return null;
      });
    }

    if (!identifyResp || !identifyResp.ok) {
      const err = identifyResp ? await identifyResp.json().catch(() => ({})) : {};
      throw new Error(`Identification failed: ${identifyResp ? identifyResp.status : 'no-response'} ${err?.error || ''}`);
    }

    const identification = await identifyResp.json();
    console.log('Identification (proxied or direct):', identification);

    // Get detailed plant information using the proper flow:
    // 1. Search for the plant by name to get access_token
    // 2. Use access_token to fetch detailed plant info
    const bestSuggestion = identification.result?.classification?.suggestions?.[0];
    const plantName = bestSuggestion?.name;
    let plantDetails = null;
    
    if (plantName) {
      console.log('Searching for plant details:', plantName);
      try {
        // Step 1: Search for the plant by name
        const searchResp = await fetch(`/api/plant-search?q=${encodeURIComponent(plantName)}&limit=1&language=en`).catch(() => null);
        
        let searchData = null;
        if (searchResp?.ok) {
          searchData = await searchResp.json();
        } else if (!devBase) {
          // Fallback to direct backend
          const directSearchResp = await fetch(`http://localhost:5000/api/plant-search?q=${encodeURIComponent(plantName)}&limit=1&language=en`).catch(() => null);
          if (directSearchResp?.ok) {
            searchData = await directSearchResp.json();
          }
        }
        
        // Step 2: If we found a match, get detailed info using the access_token
        if (searchData?.entities?.length > 0) {
          const accessToken = searchData.entities[0].access_token;
          console.log('Found plant in knowledge base, access_token:', accessToken);
          
          const detailsResp = await fetch(`/api/plant-details/${accessToken}?language=en`).catch(() => null);
          
          if (!detailsResp && !devBase) {
            // Fallback to direct backend
            const directResp = await fetch(`http://localhost:5000/api/plant-details/${accessToken}?language=en`).catch(() => null);
            if (directResp?.ok) {
              plantDetails = await directResp.json();
            }
          } else if (detailsResp?.ok) {
            plantDetails = await detailsResp.json();
          }
          
          if (plantDetails) {
            console.log('Plant details fetched successfully:', plantDetails);
            // Merge detailed info into the identification result
            if (identification.result?.classification?.suggestions?.[0]) {
              identification.result.classification.suggestions[0].details = plantDetails;
            }
          }
        } else {
          console.warn('Plant not found in knowledge base:', plantName);
        }
      } catch (err) {
        console.warn('Failed to fetch plant details (this is optional):', err);
      }
    }

    // Then, get health assessment
    // Health assessment uses the same image - it doesn't need plant_details
    const healthBody = {
      images: [base64Image],
      health: "all" // Request all health information
    };

    console.log('Requesting health assessment...');

    // Request health assessment; try proxy first, then backend directly if needed
    let healthResp = await fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthBody),
    }).catch((e) => {
      console.warn('Proxy request to /api/health failed:', e);
      return null;
    });

    if (healthResp && healthResp.status === 404) {
      console.warn('/api/health returned 404 from dev server — trying backend at http://localhost:5000/health');
      healthResp = await fetch('http://localhost:5000/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthBody),
      }).catch((e) => {
        console.error('Direct backend health request failed:', e);
        return null;
      });
    }

    if (!healthResp || !healthResp.ok) {
      console.warn('Health assessment failed or unavailable, continuing with identification only');
      console.warn('Health response status:', healthResp?.status);
      return identification;
    }

    const healthData = await healthResp.json();
    console.log('Health assessment data:', healthData);
    
    // Combine the identification and health data
    // Health assessment returns { result: { is_healthy: {...}, disease: {...} } }
    return {
      result: {
        ...identification.result,
        is_healthy: healthData.result?.is_healthy || identification.result?.is_healthy,
        disease: healthData.result?.disease || { suggestions: [] }
      }
    };
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
          {/* Loading */}
          {isLoading && (
            <div className="w-full max-w-md mb-8 text-center text-[var(--primary)]">
              <p>Identifying plant...</p>
              <div className="mt-4 h-2 bg-[var(--primary-hover)] rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="w-full max-w-md mb-8 text-center text-[var(--danger)]">
              <p>{error}</p>
              <div className="mt-6">
                <motion.button
                  onClick={handleReset}
                  className={`px-6 py-3 rounded-lg font-semibold ${darkMode ? 'bg-[var(--primary)] text-white' : 'bg-[var(--primary)] text-white'}`}>
                  Upload another?
                </motion.button>
              </div>
            </div>
          )}

          {/* Success */}
          {!isLoading && !error && plantData && (
            <>
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

              <motion.div
                className="text-left w-full max-w-md space-y-2 md:space-y-3 text-base md:text-lg"
                initial="hidden"
                animate="visible"
                variants={textVariant}
              >
                {(() => {
                  const suggestion = plantData.result.classification.suggestions[0];
                  const details = suggestion.details;
                  
                  return (
                    <>
                      <p>
                        <span className="font-semibold text-[var(--primary)]">Name:</span>{" "}
                        {suggestion.name}
                      </p>
                      
                      {details?.common_names && Array.isArray(details.common_names) && details.common_names.length > 0 && (
                        <p>
                          <span className="font-semibold text-[var(--primary)]">Common Names:</span>{" "}
                          {details.common_names.join(", ")}
                        </p>
                      )}
                      
                      {details?.taxonomy && (
                        <>
                          <p>
                            <span className="font-semibold text-[var(--primary)]">Family:</span>{" "}
                            {details.taxonomy.family}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--primary)]">Genus:</span>{" "}
                            {details.taxonomy.genus}
                          </p>
                        </>
                      )}
                      
                      <p>
                        <span className="font-semibold text-[var(--primary)]">Probability:</span>{" "}
                        {(suggestion.probability * 100).toFixed(1)}%
                      </p>
                      
                      {details?.description && typeof details.description === 'object' && 'value' in details.description && (
                        <div className="mt-4">
                          <p className="font-semibold text-[var(--primary)]">Description:</p>
                          <p className="text-sm mt-2 leading-relaxed">
                            {(details.description as any).value.slice(0, 300)}
                            {(details.description as any).value.length > 300 ? "..." : ""}
                          </p>
                          {details.url && (
                            <a 
                              href={details.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[var(--primary)] hover:underline text-sm mt-1 block"
                            >
                              Learn more →
                            </a>
                          )}
                        </div>
                      )}
                      
                      <p>
                        <span className="font-semibold text-[var(--primary)]">Scan Date:</span>{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                      
                      {plantData.result.is_plant && (
                        <p>
                          <span className="font-semibold text-[var(--primary)]">Plant Confidence:</span>{" "}
                          <span className={plantData.result.is_plant.binary ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                            {(plantData.result.is_plant.probability * 100).toFixed(1)}%
                          </span>
                        </p>
                      )}
                      
                      {/* Additional plant care info if available */}
                      {details && (
                        <>
                          {(details as any).edible_parts && Array.isArray((details as any).edible_parts) && (details as any).edible_parts.length > 0 && (
                            <p>
                              <span className="font-semibold text-[var(--primary)]">Edible Parts:</span>{" "}
                              {(details as any).edible_parts.join(", ")}
                            </p>
                          )}
                          
                          {(details as any).watering && (
                            <p>
                              <span className="font-semibold text-[var(--primary)]">Watering:</span>{" "}
                              Level {(details as any).watering.min} - {(details as any).watering.max}
                            </p>
                          )}
                          
                          {(details as any).propagation_methods && Array.isArray((details as any).propagation_methods) && (details as any).propagation_methods.length > 0 && (
                            <p>
                              <span className="font-semibold text-[var(--primary)]">Propagation:</span>{" "}
                              {(details as any).propagation_methods.join(", ")}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}

                {/* Health Assessment Results */}
                {plantData.result?.disease?.suggestions?.length ? (
                  <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <p className="font-semibold text-[var(--primary)] text-xl mb-3">Health Assessment</p>
                    
                    {/* Overall Health Status */}
                    <p className="mb-4">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={plantData.result.is_healthy?.binary ? "text-[var(--success)]" : "text-[var(--secondary)]"}>
                        {plantData.result.is_healthy?.binary ? "Healthy" : "Needs Attention"}
                      </span>
                    </p>
                    
                    {/* Health Suggestions */}
                    <div className="space-y-3">
                      {plantData.result.disease.suggestions
                        .filter((disease: any) => !disease.redundant) // Filter out redundant suggestions
                        .slice(0, 3) // Show top 3 suggestions
                        .map((disease: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="font-semibold">
                              {disease.name}{" "}
                              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                ({(disease.probability * 100).toFixed(1)}% probability)
                              </span>
                            </p>
                            
                            {disease.details?.description && (
                              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                                {disease.details.description}
                              </p>
                            )}
                            
                            {disease.details?.common_names && Array.isArray(disease.details.common_names) && disease.details.common_names.length > 0 && (
                              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                Also known as: {disease.details.common_names.join(", ")}
                              </p>
                            )}
                            
                            {disease.details?.url && (
                              <a 
                                href={disease.details.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[var(--primary)] hover:underline text-sm mt-1 block"
                              >
                                Learn more →
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <p className="font-semibold text-[var(--primary)] text-xl mb-3">Health Assessment</p>
                    <div className="bg-[var(--success)]/10 border-2 border-[var(--success)] rounded-lg p-4">
                      <p className="text-[var(--success)] font-semibold">
                        ✅ No health issues detected. Your plant appears to be healthy! 🌱
                      </p>
                    </div>
                  </div>
                )}
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
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
            console.error("Error getting user:", error);
            return null;
        }
        if (user) {
            console.log("User ID:", user.id);
            return user.id;
        } else {
            console.log("Failed to get user's ID - no user logged in!");
            return null;
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
      const details = bestMatch.details; // May contain detailed info from plant-details endpoint
      const health = plantData.result.disease;

      // include user_id and format date to YYYY-MM-DD (matches your existing inserts)
      const userId = await getUserID();
      const lastScanDate = new Date().toISOString().split('T')[0];

      // Build plant_information object with detailed data if available
      const plantInformation: any = {
        confidence: (bestMatch.probability * 100).toFixed(1) + "%",
        probability: (bestMatch.probability * 100).toFixed(1) + "%",
      };

      // Add detailed information if available, with defaults for missing data
      if (details) {
        if (details.description && typeof details.description === 'object' && 'value' in details.description) {
          plantInformation.description = (details.description as any).value;
        } else {
          plantInformation.description = `${bestMatch.name} - Plant identified via Plant.id API`;
        }
        
        if (details.taxonomy) {
          plantInformation.taxonomy = details.taxonomy;
        }
        
        if (details.common_names && Array.isArray(details.common_names) && details.common_names.length > 0) {
          plantInformation.common_names = details.common_names;
        } else {
          plantInformation.common_names = ["No common names available"];
        }
        
        if (details.url) {
          plantInformation.url = details.url;
        }
        
        // Additional fields from plant-details endpoint (may not be in basic type)
        const extendedDetails = details as any;
        
        if (extendedDetails.edible_parts && Array.isArray(extendedDetails.edible_parts)) {
          plantInformation.edible_parts = extendedDetails.edible_parts;
        } else {
          plantInformation.edible_parts = null;
        }
        
        if (extendedDetails.watering) {
          plantInformation.watering = extendedDetails.watering;
        } else {
          plantInformation.watering = null;
        }
        
        if (extendedDetails.propagation_methods && Array.isArray(extendedDetails.propagation_methods)) {
          plantInformation.propagation_methods = extendedDetails.propagation_methods;
        } else {
          plantInformation.propagation_methods = null;
        }
      } else {
        // No detailed info available - set defaults
        plantInformation.description = `${bestMatch.name} - Plant identified via Plant.id API`;
        plantInformation.common_names = ["No common names available"];
        plantInformation.edible_parts = null;
        plantInformation.watering = null;
        plantInformation.propagation_methods = null;
      }

      // Ensure health_assessment has proper structure with all fields
      const healthAssessment = {
        is_healthy: plantData.result.is_healthy || { binary: true, probability: 1.0 },
        is_plant: plantData.result.is_plant || null,
        disease: health && health.suggestions ? health : { suggestions: [] },
        question: plantData.result.question || null
      };

      const plantInfo = {
        user_id: userId,
        plant_path: filePath,
        plant_name: bestMatch.name || "Unknown Plant",
        scientific_name: details?.taxonomy ? `${details.taxonomy.genus} ${bestMatch.name.split(' ')[1] || ''}`.trim() : bestMatch.name,
        species: details?.taxonomy?.genus || bestMatch.name.split(' ')[0] || "Unknown",
        overall_health: plantData.result.is_healthy?.binary ? "Healthy" : "Needs Assessment",
        last_scan_date: lastScanDate,
        health_assesment: healthAssessment,
        plant_information: plantInformation
        };

        console.log("Attempting to insert plant info:", plantInfo);

        const { data, error } = await supabase
          .from("usersplants")
          .insert(plantInfo)
          .select();

        if (error) {
          console.error("Supabase Error:", error);
          
          // If the error is about foreign key constraint, check if user exists in users table
          if (error.code === '23503') {
            console.error("Foreign key constraint violation. The user_id might not exist in the 'users' table.");
            console.error("You may need to either:");
            console.error("1. Create a record in the 'users' table when users sign up, OR");
            console.error("2. Change the foreign key to reference 'auth.users' instead of 'public.users'");
          }
          
          throw new Error("Failed to save plant data");
        }

        console.log("Successfully inserted plant data:", data);
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
