// app/components/PlantCare.tsx

interface PlantCareProps {
  plant: {
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
    watering: 'Information not available',
    sunlight: 'Information not available',
    soil: 'Information not available',
    fertilizer: 'Information not available',
  };

  return (
    <div className="p-4 bg-green-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Plant Care Tips</h2>
      <div className="bg-white border border-green-200 rounded-lg p-4 shadow-inner">
        <ul className="list-disc list-inside space-y-2 text-green-900">
          <li>
            <strong className="font-semibold">Watering:</strong> {careTips.watering}
          </li>
          <li>
            <strong className="font-semibold">Sunlight:</strong> {careTips.sunlight}
          </li>
          <li>
            <strong className="font-semibold">Soil:</strong> {careTips.soil}
          </li>
          <li>
            <strong className="font-semibold">Fertilizer:</strong> {careTips.fertilizer}
          </li>
        </ul>
      </div>
    </div>
  );
}