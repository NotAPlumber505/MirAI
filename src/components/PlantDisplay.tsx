import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Grid, Columns } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function PlantDisplay(props:any) {
    const navigate = useNavigate();
    return (<>
            {props.plants.map((plant:any) => (
            <motion.div
            key={plant.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`shadow-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                props.layout === "grid"
                ? "flex flex-col w-full rounded-[30px] bg-[var(--navbar)]" // fully rounded, grid
                : "flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-3xl bg-[var(--navbar)]" // column
            }`}
            onClick={() => navigate(`/my-garden/${plant.id}`)}
            >
            {/* Image */}
            <div
                className={`${
                props.layout === "grid"
                    ? "w-full h-48"
                    : "w-full md:w-1/4 h-48 md:h-auto flex-shrink-0"
                }`}
            >
                <img
                src={plant.imageUrl}
                alt={plant.name}
                className="object-cover w-full h-full"
                />
            </div>

            {/* Text */}
            <div
                className={`flex flex-col p-4 md:p-6 space-y-2 text-left ${
                props.layout === "column" ? "w-full md:w-3/4" : ""
                }`}
            >
                <p
                className={`font-bold text-lg md:text-xl ${
                    props.layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                {plant.name}
                </p>
                <p
                className={`text-sm md:text-base ${
                    props.layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Scientific Name: {plant.scientificName}
                </p>
                <p
                className={`text-sm md:text-base ${
                    props.layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Species: {plant.species}
                </p>
                <p
                className={`text-sm md:text-base ${
                    props.layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Overall Health: {plant.overallHealth}
                </p>
                <p
                className={`text-sm md:text-base ${
                    props.layout === "grid"
                    ? "text-[var(--background)]"
                    : "text-[var(--background)]"
                }`}
                >
                Last Scan: {plant.lastScan}
                </p>
            </div>
            </motion.div>
        ))} 
        </>
    );
    }
