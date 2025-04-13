import { motion } from "framer-motion";
import {
  Droplets,
  Sun,
  Share2,
  Zap,
  Bean,
} from "lucide-react";
import { FlowerIcon } from "lucide-react";

interface PlantCareProps {
  plant: {
    name?: string;
    careTips?: {
      watering: string;
      sunlight: string;
      soil: string;
      fertilizer: string;
    };
    scientificName?: string;
    family?: string;
  };
}

export default function PlantCare({ plant }: PlantCareProps) {
  const careTips = plant.careTips || {
    watering: "Information not available",
    sunlight: "Information not available",
    soil: "Information not available",
    fertilizer: "Information not available",
  };

  const iconAnimation = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleShare = async () => {
    const shareData = {
      title: `Plant Care Guide: ${plant.name || plant.scientificName}`,
      text: `Check out this plant care guide for ${
        plant.name || plant.scientificName
      } (${plant.scientificName})`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Add a toast notification here
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className="p-6 bg-gradient-subtle rounded-2xl shadow-lg border border-accent-blue-100/30 backdrop-blur-xs"
    >
      <div className="bg-white/80 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-accent-teal-100/50">
        <div className="p-4 sm:p-6 border-b border-accent-blue-100 bg-gradient-cool">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">
                Plant Care Tips
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-green-50"
            >
              <Share2 className="w-5 h-5 text-green-700" />
            </motion.button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-700">Watering</h4>
              </div>
              <p className="text-gray-600 text-sm">{careTips.watering}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium text-gray-700">Sunlight</h4>
              </div>
              <p className="text-gray-600 text-sm">{careTips.sunlight}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bean className="w-5 h-5 text-green-500" />
                <h4 className="font-medium text-gray-700">Soil</h4>
              </div>
              <p className="text-gray-600 text-sm">{careTips.soil}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FlowerIcon className="w-5 h-5 text-pink-500" />
                <h4 className="font-medium text-gray-700">Fertilizer</h4>
              </div>
              <p className="text-gray-600 text-sm">{careTips.fertilizer}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
