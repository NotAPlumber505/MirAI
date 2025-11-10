import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { Github, Linkedin, Mail } from "lucide-react";

// ✅ Import local images from src/assets
import mario from "../assets/mario.png";
import marcos from "../assets/marcos.png";
import cristian from "../assets/cristian.png";

interface ExtendedTeamMember extends TeamMember {
  bullets: string[];
  orderMobile: number; // order for mobile column layout
  orderDesktop: number; // order for desktop row layout
  github?: string;
  linkedin?: string;
  email?: string;
  devpost?: string;
}

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

// Mario (Project Lead) should appear first on mobile but centered (second) on desktop.
const team: ExtendedTeamMember[] = [
  {
    name: "Marcos Arrazola",
    role: "Frontend Developer",
    imageSrc: marcos,
    bullets: [
      "Designed frontend flow for pages, navbar, footer",
      "Created avatar assets and logo asset",
    ],
    orderMobile: 2,
    orderDesktop: 1,
    github: "https://github.com/N1xed",
    linkedin: "https://www.linkedin.com/in/marcos-arrazola-51954227b/",
    email: "lightningmark1@gmail.com",
    devpost: "https://devpost.com/lightningmark1",
  },
  {
    name: "Mario Casas",
    role: "Project Manager",
    imageSrc: mario,
    bullets: [
      "Connected frontend to backend",
      "Designed initial frontend wireframe",
    ],
    orderMobile: 1,
    orderDesktop: 2, // Center position on desktop row
    github: "https://github.com/NotAPlumber505",
    linkedin: "https://www.linkedin.com/in/mario-casas-08491b21b/",
    email: "MCasas548@gmail.com",
    devpost: "https://devpost.com/mcasas548",
  },
  {
    name: "Cristian Mantilla",
    role: "Backend Developer",
    imageSrc: cristian,
    bullets: [
      "Designed Supabase schema",
      "Implemented Plant.id API integration (Scan, My Garden, Profile)",
      "Implemented Supabase connection and OAuth for auth pages",
    ],
    orderMobile: 3,
    orderDesktop: 3,
    github: "https://github.com/sonicrush",
    linkedin: "https://www.linkedin.com/in/cristian-mantilla-8560a3293/",
    email: "crisman2005@gmail.com",
    devpost: "https://devpost.com/sonicrush",
  },
];

export default function MeetTheTeam() {
  const { darkMode } = useTheme();

  // Framer Motion variants
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const containerVariant = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className={`min-h-screen px-4 md:px-12 py-12 transition-colors duration-500 ${
        darkMode ? "bg-[var(--background)]" : "bg-[var(--background)]"
      }`}
    >
      {/* Mobile GitHub Logo - shows only on mobile */}
      <div className="flex justify-center mt-12 mb-8 md:hidden">
        <a
          href="https://github.com/NotAPlumber505/MirAI"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-4 rounded-full transition-all duration-300 cursor-pointer shadow-md border-2 ${
            darkMode
              ? "bg-[var(--navbar)] text-[var(--primary)] border-transparent hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
              : "bg-white text-[var(--navbar)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
          }`}
          aria-label="View MirAI on GitHub"
        >
          <Github className="w-8 h-8" />
        </a>
      </div>

      {/* Page Header */}
      <motion.h1
        className={`text-5xl mt-20 md:text-6xl font-bold text-center mb-16 font-[var(--font-logo)] ${
          darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
        initial="hidden"
        animate="visible"
        variants={textVariant}
      >
        Meet the Team!
      </motion.h1>

      {/* Team Members Enhanced */}
      <motion.div
        className="flex flex-col md:flex-row justify-center items-stretch md:items-start md:gap-20 gap-14 flex-wrap md:flex-nowrap"
        initial="hidden"
        animate="visible"
        variants={containerVariant}
      >
        {team.map((member) => (
          <motion.div
            key={member.name}
            whileHover={{ scale: 1.04 }}
            variants={cardVariant}
            className={`flex flex-col items-center text-center w-full md:w-[320px] xl:w-[360px] cursor-pointer transition-all duration-300 order-${member.orderMobile} md:order-${member.orderDesktop}`}
          >
            {/* Circle Image enlarged */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-zinc-300 mb-6 shadow-md ring-4 ring-[var(--primary)]/30">
              <img
                src={member.imageSrc}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Name */}
            <p
              className={`text-3xl md:text-4xl font-semibold mb-2 tracking-wide ${
                darkMode ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              {member.name}
            </p>

            {/* Role */}
            <p
              className={`text-xl md:text-2xl font-medium mb-4 ${
                darkMode ? "text-[var(--navbar)]" : "text-[var(--navbar)]"
              }`}
            >
              {member.role}
            </p>

            {/* Bullet contributions */}
            <ul className={`text-base md:text-lg space-y-2 text-left list-disc list-outside ml-5 ${darkMode ? 'text-[var(--navbar)]' : 'text-[var(--navbar)]'} max-w-[95%]`}> 
              {member.bullets.map((b) => (
                <li key={b} className="leading-snug pl-2">{b}</li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full transition-all duration-300 cursor-pointer shadow-sm border ${
                    darkMode
                      ? "bg-[var(--navbar)] text-[var(--primary)] border-transparent hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                      : "bg-white text-[var(--navbar)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                  }`}
                  aria-label={`${member.name}'s GitHub`}
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full transition-all duration-300 cursor-pointer shadow-sm border ${
                    darkMode
                      ? "bg-[var(--navbar)] text-[var(--primary)] border-transparent hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                      : "bg-white text-[var(--navbar)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                  }`}
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className={`p-3 rounded-full transition-all duration-300 cursor-pointer shadow-sm border ${
                    darkMode
                      ? "bg-[var(--navbar)] text-[var(--primary)] border-transparent hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                      : "bg-white text-[var(--navbar)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                  }`}
                  aria-label={`Email ${member.name}`}
                >
                  <Mail className="w-6 h-6" />
                </a>
              )}
              {member.devpost && (
                <a
                  href={member.devpost}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm border ${
                    darkMode
                      ? "bg-[var(--navbar)] text-[var(--primary)] border-transparent hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                      : "bg-white text-[var(--navbar)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white hover:scale-110 active:scale-95"
                  }`}
                  aria-label={`${member.name}'s Devpost`}
                >
                  Devpost
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary / Professional Text */}
      <div className="mt-20 max-w-4xl mx-auto text-center px-4">
        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>What We Built</h2>
        <p className={`text-lg md:text-xl leading-relaxed mb-10 ${darkMode ? 'text-[var(--navbar)]' : 'text-[var(--navbar)]'}`}>
          Together we engineered MirAI: a plant-focused platform integrating real-time identification, health assessment, and personalized care guidance. Our collaboration spanned UX ideation, data modeling, API integration, secure authentication, and a responsive, theme-aware interface.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-[var(--primary)]/30 shadow-sm">
            <h3 className={`text-2xl text-center font-semibold mb-3 ${darkMode ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>Frontend</h3>
            <ul className={`list-disc list-outside ml-5 space-y-2 text-base md:text-lg ${darkMode ? 'text-[var(--navbar)]' : 'text-[var(--navbar)]'}`}>
              <li className="pl-2">Responsive React + TypeScript architecture</li>
              <li className="pl-2">Dynamic theming & avatar system</li>
              <li className="pl-2">Accessible navigation & layout</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-[var(--primary)]/30 shadow-sm">
            <h3 className={`text-2xl text-center font-semibold mb-3 ${darkMode ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>Backend</h3>
            <ul className={`list-disc list-outside ml-5 space-y-2 text-base md:text-lg ${darkMode ? 'text-[var(--navbar)]' : 'text-[var(--navbar)]'}`}>
              <li className="pl-2">Supabase schema & secure auth</li>
              <li className="pl-2">Plant.id API integration workflow</li>
              <li className="pl-2">Data enrichment & health metrics</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-[var(--primary)]/30 shadow-sm">
            <h3 className={`text-2xl text-center font-semibold mb-3 ${darkMode ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>Product</h3>
            <ul className={`list-disc list-outside ml-5 space-y-2 text-base md:text-lg ${darkMode ? 'text-[var(--navbar)]' : 'text-[var(--navbar)]'}`}>
              <li className="pl-2">Wireframing & UX iteration</li>
              <li className="pl-2">Feature scoping & prioritization</li>
              <li className="pl-2">Continuous feedback integration</li>
            </ul>
          </div>
        </div>
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
