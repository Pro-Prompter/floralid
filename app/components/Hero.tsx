"use client";

import { useState } from "react";
import {
  Camera,
  Leaf,
  Sprout,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';

// Remove the hardcoded API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

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

interface ImageUploadProps {
  setIdentifiedPlant: (plant: IdentifiedPlant | null) => void;
}

// Sample plants array with improved descriptions
const samplePlants = [
  {
    name: "Zanzibar Gem",
    url: "/samples/ZZ.jpg",
    description: "ZZ Plant",
  },
  {
    name: "Snake Plant",
    url: "/samples/Snake.jpg",
    description: "Snake Plant",
  },
  {
    name: "Rubber Plant",
    url: "/samples/Rubber.jpg",
    description: "Rubber Plant",
  },
];

export default function ImageUpload({ setIdentifiedPlant }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plantData, setPlantData] = useState<IdentifiedPlant | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      setImage(URL.createObjectURL(imageFile));
      await identifyPlant(imageFile);
    } else {
      setError("Please drop an image file");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Batch state updates
        const objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);
        await identifyPlant(file);
      } catch (error) {
        console.error("Error handling image upload:", error);
        setError("Failed to process image");
      }
    }
  };

  // Update other handlers to remove setActiveTab calls
  // Rename to handleDropEvent to avoid duplicate declaration
  const handleDropEvent = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      setImage(URL.createObjectURL(imageFile));
      await identifyPlant(imageFile);
      // Remove setActiveTab("result");
    } else {
      setError("Please drop an image file");
    }
  };

  const handleCameraCapture = async () => {
    setError(null);
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });

      if (image.base64String) {
        const blob = await fetch(`data:image/jpeg;base64,${image.base64String}`).then(r => r.blob());
        setImage(URL.createObjectURL(blob));
        await identifyPlant(blob);
      } else {
        setError("Failed to capture image");
      }
    } catch (err) {
      setError(`Error capturing image: ${err}`);
    }
  };

  const handleSampleClick = async (sampleUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      setImage(URL.createObjectURL(blob));
      await identifyPlant(blob);
      // Remove setActiveTab("result");
    } catch (error) {
      setError("Failed to load sample image");
    } finally {
      setLoading(false);
    }
  };

  const identifyPlant = async (imageFile: File | Blob) => {
    setLoading(true);
    setError(null);
    setPlantData(null);

    try {
      const reader = new FileReader();

      const readerPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(",")[1] || "";
          resolve(base64data);
        };
        reader.onerror = () => reject(new Error("Failed to read image file"));
      });

      reader.readAsDataURL(imageFile);
      const base64data = await readerPromise;

      const imageParts = [
        {
          inlineData: {
            data: base64data,
            mimeType: imageFile.type,
          },
        },
      ];

      const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-pro-vision",
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent([
        "You are a professional botanist. Analyze this plant image and provide detailed information. IMPORTANT: Distinguish between common names and scientific names carefully.",
        "Format your response EXACTLY as follows:",
        "Name: [ONLY common names or trade names, separated by commas if multiple exist]",
        "Scientific name: [ONLY the full Latin botanical name - genus and species]",
        "Family: [plant family name]",
        "Description: [detailed physical characteristics including leaf shape, color, growth pattern, size, and distinctive features]",
        "Watering: [specific watering frequency, amount, and signs of over/under watering]",
        "Sunlight: [detailed light requirements and placement recommendations]",
        "Soil: [soil type, pH preferences, drainage requirements]",
        "Fertilizer: [fertilizer type, frequency, and nutrient requirements]",
        "IMPORTANT RULES:",
        "- If you see a Latin name in binomial nomenclature (genus + species), it MUST go under Scientific name, not common name",
        "- Common names should be in plain English/local language",
        "- Never leave Scientific name empty if you can identify the species",
        "- Be specific about which is the primary common name",
        ...imageParts,
      ]);

      if (!result.response) {
        throw new Error("No response from AI model");
      }

      const responseText = await result.response.text();
      const plantInfo = parsePlantInfo(responseText);
      // Update both states at once in a microtask to allow batching
      queueMicrotask(() => {
        setPlantData(plantInfo);
        setIdentifiedPlant(plantInfo);
        setLoading(false);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to identify plant";
      queueMicrotask(() => {
        setError(errorMessage);
        setIdentifiedPlant(null);
        setLoading(false);
      });
    }
  };

  const parsePlantInfo = (responseText: string): IdentifiedPlant => {
    const lines = responseText.split("\n");
    const info: Partial<IdentifiedPlant> = {
      name: "",
      scientificName: "",
      family: "",
      description: "",
    };
    const careTips: Partial<IdentifiedPlant["careTips"]> = {};

    let currentSection = "";
    let currentContent = "";

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Check for main section headers
      if (line.toLowerCase().includes("name:")) {
        currentSection = "name";
        currentContent = line.split(":")[1]?.trim() || "";
        info.name = currentContent;
      } else if (line.toLowerCase().includes("scientific name:")) {
        currentSection = "scientific";
        currentContent = line.split(":")[1]?.trim() || "";
        info.scientificName = currentContent;
      } else if (line.toLowerCase().includes("family:")) {
        currentSection = "family";
        currentContent = line.split(":")[1]?.trim() || "";
        info.family = currentContent;
      } else if (line.toLowerCase().includes("description:")) {
        currentSection = "description";
        currentContent = line.split(":")[1]?.trim() || "";
        info.description = currentContent;
      } else if (line.toLowerCase().includes("watering:")) {
        careTips.watering =
          line.split(":")[1]?.trim() || "No watering information available";
      } else if (line.toLowerCase().includes("sunlight:")) {
        careTips.sunlight =
          line.split(":")[1]?.trim() || "No sunlight information available";
      } else if (line.toLowerCase().includes("soil:")) {
        careTips.soil =
          line.split(":")[1]?.trim() || "No soil information available";
      } else if (line.toLowerCase().includes("fertilizer:")) {
        careTips.fertilizer =
          line.split(":")[1]?.trim() || "No fertilizer information available";
      } else {
        // Append content to current section if it's a continuation
        if (currentSection) {
          currentContent += " " + line;
          switch (currentSection) {
            case "name":
              info.name = currentContent;
              break;
            case "scientific":
              info.scientificName = currentContent;
              break;
            case "family":
              info.family = currentContent;
              break;
            case "description":
              info.description = currentContent;
              break;
          }
        }
      }
    }

    // Set default values if any required field is missing
    // Clean up the text by removing markdown asterisks
    info.name = info.name?.replace(/\*/g, "") || "Unknown Plant";
    info.scientificName =
      info.scientificName?.replace(/\*/g, "") ||
      "Scientific name not available";
    info.family = info.family?.replace(/\*/g, "") || "Family not available";
    info.description =
      info.description?.replace(/\*/g, "") || "No description available";

    return {
      ...info,
      careTips: {
        watering:
          careTips.watering?.replace(/\*/g, "") ||
          "Watering information not available",
        sunlight:
          careTips.sunlight?.replace(/\*/g, "") ||
          "Sunlight information not available",
        soil:
          careTips.soil?.replace(/\*/g, "") || "Soil information not available",
        fertilizer:
          careTips.fertilizer?.replace(/\*/g, "") ||
          "Fertilizer information not available",
      },
    } as IdentifiedPlant;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8"
    >
      <motion.div
        className="relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
          shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 sm:p-6 md:p-8 overflow-hidden 
          border border-white/40 bg-gradient-to-b from-white/50 to-white/30"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <svg
            viewBox="0 0 61 61"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <pattern
                id="svg-pattern"
                x="0"
                y="0"
                width="43"
                height="43"
                patternUnits="userSpaceOnUse"
                patternTransform="translate(18, 18) rotate(0) skewX(0)"
              >
                <svg width="25" height="25" viewBox="0 0 100 100">
                  <g fill="#1f4d29" opacity="0.6">
                    <path
                      d="M0 0C27.6142 0 50 22.3858 50 50V100C22.3858 100 0 77.6142 0 50V0Z"
                      opacity="0.5"
                    ></path>
                    <path d="M50 100C77.6142 100 100 77.6142 100 50V0C72.3858 0 50 22.3858 50 50V100Z"></path>
                  </g>
                </svg>
              </pattern>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#svg-pattern)"
            ></rect>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-6 relative">
          {/* Header */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center">
              <motion.div
                className="p-4 bg-green-100 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sprout className="w-8 h-8 text-green-600" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-bold text-green-800">
              Welcome to FloralID
            </h1>
            <h2 className="text-2xl font-semibold text-green-700">
              Identify plants and learn how to care for them
            </h2>
          </motion.div>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-2xl"
              >
                {/* Enhanced Upload Area */}
                <motion.div
                  className={`w-full bg-white/80 rounded-xl sm:rounded-2xl p-6 shadow-lg border-2 border-dashed ${
                    isDragging
                      ? "border-green-400 bg-green-50/50"
                      : "border-green-200"
                  } transition-colors duration-200`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-center space-y-4">
                    <Upload className="w-12 h-12 text-green-500 mx-auto" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700">
                        Drop your plant photo here
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
                      <label
                        className="flex-1 px-6 py-4 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl 
                          shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 
                          cursor-pointer flex items-center justify-center gap-3 max-w-xs mx-auto"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Choose File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                      </label>
                      <button
                        onClick={handleCameraCapture}
                        className="flex-1 px-6 py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl 
                          shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 
                          flex items-center justify-center gap-3 max-w-xs mx-auto"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="font-medium">Take Photo</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Sample Plants Section */}
                <motion.div
                  className="mt-12 space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-3 mb-3">
                      <ImageIcon className="w-7 h-7 text-green-600" />
                      No Plants Nearby ?
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Try one of these sample plants:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {samplePlants.map((sample) => (
                      <motion.button
                        key={sample.name}
                        onClick={() => handleSampleClick(sample.url)}
                        className="group relative bg-green-800/10 rounded-2xl overflow-hidden
                          hover:bg-green-800/20 transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-green-500"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-[4/5] relative">
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-green-900/80 p-4">
                            <p className="text-white font-medium text-lg text-center">
                              {sample.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="results-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start"
              >
                {image && (
                  <motion.div
                    key="image-preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="lg:sticky lg:top-4 space-y-3 sm:space-y-4"
                  >
                    <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl bg-white p-2">
                      <img
                        src={image}
                        alt="Uploaded plant"
                        className="w-full h-auto rounded-lg sm:rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4 sm:space-y-6">
                  <AnimatePresence mode="wait">
                    {loading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl"
                      >
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">
                          Analyzing your plant...
                        </p>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          <p className="font-medium">Error</p>
                        </div>
                        <p className="text-sm mt-1">{error}</p>
                      </motion.div>
                    )}

                    {plantData && (
                      <motion.div
                        key="plant-data"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4 sm:space-y-6"
                      >
                        {/* Plant Info Card */}
                        <div className="bg-white/90 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-100">
                          <div className="p-6 border-b border-green-100 bg-green-50/50">
                            <div className="flex items-center gap-3">
                              <Leaf className="w-6 h-6 text-green-600" />
                              <div>
                                <h3 className="text-2xl font-bold text-green-800">
                                  {plantData.name}
                                </h3>
                                <p className="text-gray-600 italic">
                                  {plantData.scientificName}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Family
                                </h4>
                                <p className="mt-1 text-gray-900">
                                  {plantData.family}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Description
                                </h4>
                                <p className="mt-1 text-gray-900">
                                  {plantData.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
