// app/page.tsx
"use client";

import { useState, useCallback } from "react";
import Hero from "./components/Hero";
import PlantCare from "./components/PlantCare";
import PlantComparison from "./components/PlantComparison";
import { Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IdentifiedPlant {
  name: string;
  scientificName: string;
  family: string;
  description: string;
  careTips: {
    watering: string;
    sunlight: string;
    soil: string;
    fertilizer: string;
  };
}

export default function Home() {
  const [identifiedPlant, setIdentifiedPlant] = useState<IdentifiedPlant | null>(null);
  const [comparedPlants, setComparedPlants] = useState<IdentifiedPlant[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCompare = useCallback((plant: IdentifiedPlant) => {
    if (comparedPlants.length < 2) {
      setIsAdding(true);
      // Add a small delay to make the animation smoother
      setTimeout(() => {
        setComparedPlants(prev => [...prev, plant]);
        setIsAdding(false);
      }, 300);
    }
  }, [comparedPlants.length]);

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <Hero setIdentifiedPlant={setIdentifiedPlant} />
        
        <AnimatePresence mode="wait">
          {identifiedPlant && (
            <>
              <PlantCare plant={identifiedPlant} />
              <div className="flex justify-center w-full">
                <motion.button
                  onClick={() => handleAddToCompare(identifiedPlant)}
                  className="mt-4 px-6 py-4 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl 
                    shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 
                    flex items-center justify-center gap-3 max-w-xs"
                  disabled={comparedPlants.length >= 2 || isAdding}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sprout className="w-5 h-5" />
                  <span className="font-medium">
                    {isAdding ? "Adding..." : "Add to Compare"}
                  </span>
                </motion.button>
              </div>
            </>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {comparedPlants.length > 0 && (
            <PlantComparison plants={comparedPlants} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
