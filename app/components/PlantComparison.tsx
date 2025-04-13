import { motion } from "framer-motion";
import { Sprout, Check, X } from "lucide-react";

interface ComparisonProps {
  plants: Array<{
    name: string;
    scientificName: string;
    careTips: {
      watering: string;
      sunlight: string;
      soil: string;
      fertilizer: string;
    };
  }>;
}

export default function PlantComparison({ plants }: ComparisonProps) {
  if (plants.length < 2) return null;

  const compareCareTips = (tip1: string, tip2: string) => {
    const keywords = {
      easier: ['easy', 'simple', 'tolerant', 'adaptable', 'moderate', 'flexible'],
      harder: ['difficult', 'sensitive', 'requires', 'careful', 'specific', 'strict']
    };
    
    const score1 = keywords.easier.filter(word => tip1.toLowerCase().includes(word)).length -
                  keywords.harder.filter(word => tip1.toLowerCase().includes(word)).length;
    const score2 = keywords.easier.filter(word => tip2.toLowerCase().includes(word)).length -
                  keywords.harder.filter(word => tip2.toLowerCase().includes(word)).length;
    
    return score1 > score2 ? 'pros' : score1 < score2 ? 'cons' : 'neutral';
  };

  type CareTipKey = keyof typeof plants[0]['careTips'];
  const careTipEntries = Object.entries(plants[0].careTips) as [CareTipKey, string][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-linear-to-br from-white via-green-50/30 to-sage-50/30 rounded-2xl shadow-lg backdrop-blur-xs border border-sage-100/50"
    >
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-800 to-green-600 mb-6 flex items-center gap-2">
        <Sprout className="w-6 h-6 text-green-600" />
        Plant Comparison
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sage-100">
              <th className="px-4 py-2 text-left">Care Aspect</th>
              {plants.slice(0, 2).map((plant, index) => (
                <th key={index} className="px-4 py-2 text-left">
                  <div className="font-semibold text-lg text-green-800">{plant.name}</div>
                  <div className="text-sm italic text-green-700/70">{plant.scientificName}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {careTipEntries.map(([aspect, tip1]) => {
              const tip2 = plants[1].careTips[aspect];
              const comparison = compareCareTips(tip1, tip2);
              
              return (
                <tr key={aspect} className="border-b border-sage-50">
                  <td className="px-4 py-3 font-medium capitalize text-green-800">{aspect}</td>
                  {[tip1, tip2].map((tip, index) => (
                    <td 
                      key={index} 
                      className={`px-4 py-3 ${
                        comparison !== 'neutral' && index === 0
                          ? comparison === 'pros'
                            ? 'bg-green-50/50'
                            : 'bg-red-50/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {comparison !== 'neutral' && index === 0 && (
                          <span className="mt-1">
                            {comparison === 'pros' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                          </span>
                        )}
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}