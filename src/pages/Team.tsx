import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

// ✅ Import local images from src/assets
import mario from "../assets/mario.png";
import marcos from "../assets/marcos.png";
import cristian from "../assets/cristian.png";

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

const team: TeamMember[] = [
  { name: "Marcos Arrazola", role: "Frontend Developer", imageSrc: marcos },
  { name: "Mario Casas", role: "Project Lead", imageSrc: mario },
  { name: "Cristian Mantilla", role: "Backend Developer", imageSrc: cristian },
];

export default function MeetTheTeam() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen px-4 md:px-12 py-12 transition-colors duration-500 ${
        darkMode ? "bg-[var(--background)]" : "bg-[var(--background)]"
      }`}
    >
      {/* Page Header */}
      <h1
        className={`text-5xl mt-20 md:text-6xl font-bold text-center mb-16 font-[var(--font-logo)] ${
          darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
      >
        Meet the Team!
      </h1>

      {/* Team Members */}
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:gap-16 gap-10 flex-wrap md:flex-nowrap">
        {team.map((member) => (
          <motion.div
            key={member.name}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center text-center w-full md:w-auto max-w-[280px] cursor-pointer transition-all duration-300"
          >
            {/* Circle Image */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-zinc-300 mb-4 shrink-0">
              <img
                src={member.imageSrc}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <p
              className={`text-2xl md:text-3xl font-medium mb-1 whitespace-nowrap ${
                darkMode
                  ? "text-[var(--primary)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {member.name}
            </p>

            {/* Role */}
            <p
              className={`text-lg md:text-xl font-normal whitespace-nowrap ${
                darkMode
                  ? "text-[var(--navbar)]"
                  : "text-[var(--navbar)]"
              }`}
            >
              {member.role}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mobile-only footer */}
      <footer className="mt-30 mb-10 text-sm block md:hidden text-center">
        <p
          className={`${
            darkMode ? "text-white" : "text-[var(--navbar)]"
          } transition-colors duration-300`}
        >
          © 2025 MirAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
