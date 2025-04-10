// app/page.tsx
"use client"; // Add this directive at the top

import Image from 'next/image';
import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import PlantInfo from './components/PlantInfo';
import PlantCare from './components/PlantCare';

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

  return (
    <div className="grid grid-rows-[20px_1fr] min-h-screen">
      <main className="flex flex-col gap-8 p-24">
        <h1 className="text-4xl font-bold text-center">Welcome to FloralID</h1>
        <p className="text-center text-xl">
          Identify plants and learn how to care for them
        </p>
        <ImageUpload setIdentifiedPlant={setIdentifiedPlant} />
        {identifiedPlant && (
          <>
            <PlantInfo plant={identifiedPlant} />
            <PlantCare plant={identifiedPlant} />
          </>
        )}
      </main>
    </div>
  );
}