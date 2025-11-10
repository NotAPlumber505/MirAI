import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

// Import avatar assets
import sunflowerAvatar from "../assets/avatars/Sunny.png";
import orchidAvatar from "../assets/avatars/Orchid.png";
import fernAvatar from "../assets/avatars/Fern.png";
import cactiAvatar from "../assets/avatars/Cacti.png";

export default function Profile({ supabase, isLoggedIn }: any) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [plants, setPlants] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState("");
  const currentPlant = plants[index];

  // Avatar type assignment based on plant family/taxonomy
  const getAvatarType = (plant: any): string => {
    const family = plant.plant_information?.taxonomy?.family?.toLowerCase() || '';
    const genus = plant.plant_information?.taxonomy?.genus?.toLowerCase() || '';
    const name = plant.plant_name?.toLowerCase() || '';

    // Sunflower - Asteraceae family or contains "sunflower"
    if (family.includes('asteraceae') || name.includes('sunflower') || genus.includes('helianthus')) {
      return 'sunflower';
    }
    // Orchid - Orchidaceae family or contains "orchid"
    if (family.includes('orchidaceae') || name.includes('orchid')) {
      return 'orchid';
    }
    // Cacti - Cactaceae family or contains "cactus"
    if (family.includes('cactaceae') || name.includes('cactus') || name.includes('cacti')) {
      return 'cacti';
    }
    // Fern - Polypodiaceae, Aspleniaceae, or other fern families, or contains "fern"
    if (family.includes('polypodiaceae') || family.includes('aspleniaceae') || 
        family.includes('pteridaceae') || name.includes('fern') || 
        genus.includes('pteris') || genus.includes('polypodium')) {
      return 'fern';
    }
    
    // Default to fern for all other plants
    return 'fern';
  };

  // Get avatar image based on type
  const getAvatarImage = (avatarType: string): string => {
    const avatarImages = {
      sunflower: sunflowerAvatar,
      orchid: orchidAvatar,
      fern: fernAvatar,
      cacti: cactiAvatar,
    };
    return avatarImages[avatarType as keyof typeof avatarImages] || fernAvatar;
  };

  // Pretty names and short personalities for each avatar type
  const getAvatarMeta = (avatarType: string): { name: string; tagline: string } => {
    const meta = {
      sunflower: {
        name: "Sunny",
        tagline: "Bright, optimistic, thrives in light.",
      },
      fern: {
        name: "Willow",
        tagline: "Calm, adaptable, prefers shade.",
      },
      cacti: {
        name: "Sage",
        tagline: "Resilient, low-maintenance, strong-willed.",
      },
      orchid: {
        name: "Opal",
        tagline: "Elegant, high-maintenance, thrives with care.",
      },
    } as const;
    return meta[(avatarType as keyof typeof meta) || "fern"] || meta.fern;
  };

  // Framer Motion text animation variant
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        // Always verify session server-side; if no session, redirect to login
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          navigate("/login");
          return;
        }

        const user = session.user;
        // Extract username intelligently
        const userMetaUsername = user?.user_metadata?.username;
        const userEmail = user?.email || '';
        
        // If username exists in metadata, use it
        // Otherwise, extract the part before @ from email
        const displayName = userMetaUsername || 
                           (userEmail ? userEmail.split('@')[0] : 'User');
        
        setUsername(displayName);

        // Fetch plants for the logged-in user from usersplants table
        const { data: plantsData, error } = await supabase
          .from("usersplants")
          .select("*")
          .eq("user_id", user.id)
          .order('last_scan_date', { ascending: false });

        if (error) {
          console.error("Error fetching plants:", error);
          setPlants([]);
        } else {
          // Process plants to add avatar images
          const processedPlants = (plantsData || []).map((plant: any) => {
            const avatarType = getAvatarType(plant);
            const avatarImage = getAvatarImage(avatarType);
            
            // Debug logging to verify avatar assignment
            console.log(`Plant: ${plant.plant_name}`);
            console.log(`  Family: ${plant.plant_information?.taxonomy?.family}`);
            console.log(`  Avatar Type: ${avatarType}`);
            console.log(`  Avatar Image:`, avatarImage);
            
            return {
              ...plant,
              avatarType,
              avatarImage
            };
          });
          setPlants(processedPlants);
        }
      } catch (err) {
        console.error("Unexpected error fetching plants:", err);
        setPlants([]);
      }
    };
    fetchPlants();
  }, [isLoggedIn]);

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Supabase error!", error);
    else navigate("/");
  }

  async function deletePlant(indexToDelete: number) {
    const plantToDelete = plants[indexToDelete];

    const { error } = await supabase
      .from("usersplants")
      .delete()
      .eq("id", plantToDelete.id);

    if (!error) {
      setPlants((prev) => prev.filter((_, i) => i !== indexToDelete));
      setIndex(0);
    } else {
      console.log("Error deleting plant:", error);
    }
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col md:flex-row justify-between items-center px-6 md:px-16 pt-10 pb-36 transition-colors duration-500 ${
        darkMode
          ? "bg-[var(--background)] text-white"
          : "bg-[var(--background)] text-[var(--navbar)]"
      }`}
    >
      {/* 🖐️ Greeting */}
      <motion.h1
        className={`w-full mt-16 px-6 md:px-0 text-center md:text-left md:absolute md:top-16 md:left-8 text-3xl md:text-6xl font-semibold pb-4 md:pb-0 ${
          darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        Hello, {username}! 🌿
      </motion.h1>

      {/* 📱 Mobile quick actions directly below greeting */}
      <div className="md:hidden w-full px-6 flex flex-col items-stretch gap-3 mt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/reset-password")}
          className={`mt-10 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition border ${
            darkMode
              ? "bg-[var(--secondary)] text-[var(--background)] border-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
              : "bg-[var(--secondary)] text-[var(--navbar)] border-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
          }`}
        >
          Change Password
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${
            darkMode
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Logout
        </motion.button>
      </div>

      {/* 🧭 Desktop Logout */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className={`hidden md:flex items-center gap-2 absolute top-30 right-20 px-10 py-4 rounded-lg font-semibold cursor-pointer transition ${
          darkMode
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        Logout
      </motion.button>

      {/* 🔑 Desktop Change Password Link */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/reset-password")}
        className={`hidden md:flex items-center gap-2 absolute top-52 right-20 px-6 py-2 rounded-lg text-sm font-medium cursor-pointer transition border ${
          darkMode
            ? "bg-[var(--secondary)] text-[var(--background)] border-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
            : "bg-[var(--secondary)] text-[var(--navbar)] border-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
        }`}
      >
        Change Password
      </motion.button>

      {/* 🪴 No Avatars */}
      {plants.length === 0 ? (
        <div className="relative w-full flex flex-col justify-center items-center text-center px-6 md:px-16 flex-1">
          <motion.div
            className="flex flex-col justify-center items-center h-full"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h2
              className={`text-3xl font-bold mb-4 ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              You don’t have any plant avatars yet! 🌱
            </h2>
            <p className="text-lg mb-6">
              Scan a plant to start your journey and take care of your green friends.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/scan")}
              className={`px-6 py-3 rounded-lg font-semibold cursor-pointer ${
                darkMode
                  ? "bg-[var(--primary)] hover:bg-green-700 text-white"
                  : "bg-[var(--primary)] hover:bg-green-600 text-white"
              }`}
            >
              Go to Scan Page
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* 🌻 Left: Avatar Display */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col items-center md:items-start mt-12 md:mt-56 mb-8 md:mb-0"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h1
              className={`text-3xl md:text-5xl font-bold mb-4 text-center md:text-left ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Chosen Avatar:
            </h1>

            {/* Avatar centered between arrows */}
            <div className="flex items-center justify-center w-full mb-6 gap-6 md:gap-10">
              {index > 0 ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIndex(index - 1)}
                  className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[var(--primary)] text-4xl font-bold border-2 rounded-full transition-transform cursor-pointer"
                >
                  ←
                </motion.button>
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14" />
              )}
              <motion.img
                key={currentPlant?.plant_name}
                src={currentPlant?.avatarImage}
                alt={currentPlant?.plant_name}
                className="w-80 h-80 md:w-[500px] md:h-[500px] object-contain mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              {index < plants.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIndex(index + 1)}
                  className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[var(--primary)] text-4xl font-bold border-2 rounded-full transition-transform cursor-pointer"
                >
                  →
                </motion.button>
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14" />
              )}
            </div>

            {/* Avatar Name + Personality */}
            <div className="w-full text-center -mt-2 mb-2">
              <p className="text-2xl font-semibold text-[var(--primary)]">
                {getAvatarMeta(currentPlant?.avatarType || 'fern').name}
              </p>
              <p className="text-sm text-[var(--navbar)] opacity-80">
                {getAvatarMeta(currentPlant?.avatarType || 'fern').tagline}
              </p>
            </div>

            {/* Delete Plant */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => deletePlant(index)}
              className={`mt-6 px-10 py-4 rounded-4xl font-semibold transition cursor-pointer ${
                darkMode
                  ? "bg-[var(--primary)] hover:bg-[var(--navbar)] text-[var(--background))]"
                  : "bg-[var(--primary)] hover:bg-[var(--navbar)] text-[var(--background)]"
              }`}
            >
              Free This Plant 🌾
            </motion.button>
          </motion.div>

          {/* 🌿 Right: Plant Info */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col md:pl-10 text-left"
            initial="hidden"
            animate="visible"
            variants={textVariant}
          >
            <h2
              className={`text-4xl font-semibold mt-10 md:mt-40 mb-4 text-center md:text-left ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Plant Information
            </h2>

            <div className="space-y-2 text-lg text-[var(--navbar)]">
              <p>
                <strong className="text-[var(--primary)]">Name: </strong>
                {currentPlant?.avatarType === 'sunflower' && '🌻 '}
                {currentPlant?.avatarType === 'orchid' && '🌺 '}
                {currentPlant?.avatarType === 'fern' && '🌿 '}
                {currentPlant?.avatarType === 'cacti' && '🌵 '}
                {currentPlant?.plant_name || 'Unknown Plant'}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Scientific Name: </strong>
                <em>{currentPlant?.scientific_name || 'Not available'}</em>
              </p>
              <p>
                <strong className="text-[var(--primary)]">Species: </strong>
                {currentPlant?.species || 'Not available'}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Common Names: </strong>
                {currentPlant?.plant_information?.common_names?.filter((n: string) => n !== 'No common names available').join(', ') || 'Not available'}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Family/Genus: </strong>
                {currentPlant?.plant_information?.taxonomy?.family || 'Unknown'} / {currentPlant?.plant_information?.taxonomy?.genus || 'Unknown'}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Description: </strong>
                {currentPlant?.plant_information?.description || `${currentPlant?.plant_name} - No description available.`}
              </p>
              {currentPlant?.plant_information?.url && (
                <p>
                  <a 
                    href={currentPlant.plant_information.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    📖 Learn more on Wikipedia →
                  </a>
                </p>
              )}
            </div>

            <h2
              className={`text-4xl font-semibold mt-10 mb-4 text-center md:text-left ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Health Assessment
            </h2>

            <div className="space-y-2 text-lg text-[var(--navbar)]">
              <p>
                <strong className="text-[var(--primary)]">Overall Health: </strong>
                <span className={currentPlant?.health_assesment?.is_healthy?.binary ? "text-[var(--success)]" : "text-[var(--secondary)]"}>
                  {currentPlant?.health_assesment?.is_healthy?.binary ? '🟢 Healthy' : '🟠 Needs Attention'}
                </span>
                {currentPlant?.health_assesment?.is_healthy?.probability && (
                  <span> ({Math.round(currentPlant.health_assesment.is_healthy.probability * 100)}% confidence)</span>
                )}
              </p>
              <p>
                <strong className="text-[var(--primary)]">Detected issues: </strong>
                {currentPlant?.health_assesment?.disease?.suggestions?.length > 0 
                  ? currentPlant.health_assesment.disease.suggestions
                      .filter((s: any) => !s.redundant)
                      .slice(0, 3)
                      .map((s: any) => s.name)
                      .join(', ')
                  : 'No issues detected'}
              </p>
              {currentPlant?.health_assesment?.disease?.suggestions?.[0] && (
                <>
                  <p>
                    <strong className="text-[var(--primary)]">Cause: </strong>
                    {currentPlant.health_assesment.disease.suggestions[0].details?.description?.slice(0, 150) || 'Not available'}
                    {currentPlant.health_assesment.disease.suggestions[0].details?.description?.length > 150 && '...'}
                  </p>
                  <p>
                    <strong className="text-[var(--primary)]">Recommended action: </strong>
                    {currentPlant.health_assesment.disease.suggestions[0].details?.url ? (
                      <a 
                        href={currentPlant.health_assesment.disease.suggestions[0].details.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:underline"
                      >
                        Learn more about treatment →
                      </a>
                    ) : 'Consult care guide'}
                  </p>
                </>
              )}
              <p>
                <strong className="text-[var(--primary)]">Last Scan Date: </strong>
                {currentPlant?.last_scan_date ? new Date(currentPlant.last_scan_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available'}
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* (Removed bottom-fixed mobile buttons; replaced by top quick actions) */}

      {/* 📱 Mobile Footer */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm block md:hidden text-center">
        <p className={`${darkMode ? "text-white" : "text-[var(--navbar)]"} transition-colors duration-300`}>
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
