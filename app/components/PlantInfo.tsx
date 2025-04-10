"use client";

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded API key (be cautious with this approach in production)
const GOOGLE_API_KEY = 'AIzaSyCA0rnzkWOxop9l9UcwZ84Sr263yWDf0C0';
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

interface IdentifiedPlant {
  name: string;
  scientificName: string;
  family: string;
  description: string;
  careTips?: {
    watering: string;
    sunlight: string;
    soil: string;
    fertilizer: string;
  };
}

export default function PlantInfo() {
  const [image, setImage] = useState<string | null>(null);
  const [identifiedPlant, setIdentifiedPlant] = useState<IdentifiedPlant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploaded file:', file); // Log the uploaded file
      setImage(URL.createObjectURL(file));
      await identifyPlant(file);
    }
  };

  const handleCameraCapture = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
        video.onerror = () => reject(new Error('Error loading video metadata'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
      }

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        if (blob) {
          setImage(URL.createObjectURL(blob));
          await identifyPlant(blob);
        } else {
          setError('Failed to capture image from camera');
        }
      });
    } catch (err) {
      setError(`Error capturing image: ${err}`);
    }
  };

  const identifyPlant = async (imageFile: File | Blob) => {
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1] || '';
        console.log('Base64 image data:', base64data); // Log the base64 data

        const imageParts = [
          {
            inlineData: {
              data: base64data,
              mimeType: imageFile.type,
            },
          },
        ];

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Request to AI model:', {
          prompt: 'Identify this plant and provide the following information:\nname, scientific name, family, brief description, and care tips including watering, sunlight, soil, and fertilizer requirements.',
          parts: imageParts,
        }); // Log the request details

        const result = await model.generateContent([ 
          'Identify this plant and provide the following information:',
          'name, scientific name, family, brief description, and care tips including watering, sunlight, soil, and fertilizer requirements.',
          ...imageParts,
        ]);

        if (result.response && typeof result.response.text === 'function') {
          const responseText = await result.response.text();
          console.log('API response text:', responseText); // Log the raw response text

          const plantInfo = parsePlantInfo(responseText);
          console.log('Parsed plant info:', plantInfo); // Log the parsed plant info

          setIdentifiedPlant(plantInfo);
        } else {
          throw new Error('Unexpected response format');
        }
      };
    } catch (err) {
      setError(`Error identifying plant: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const parsePlantInfo = (responseText: string): IdentifiedPlant => {
    const plantInfo: { [key: string]: string } = {};
    const lines = responseText.split('\n');
    
    let currentKey = '';
    let currentValue = '';
  
    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim());
  
      if (key && value) {
        if (key === 'Care Tips') {
          if (currentKey) {
            plantInfo[currentKey] = currentValue.trim();
          }
          currentKey = key;
          currentValue = value;
        } else if (currentKey === 'Care Tips' && key === '') {
          currentValue += `\n${value}`;
        } else {
          if (currentKey) {
            plantInfo[currentKey] = currentValue.trim();
          }
          currentKey = key;
          currentValue = value;
        }
      } else if (currentKey) {
        currentValue += `\n${line.trim()}`;
      }
    }
  
    if (currentKey) {
      plantInfo[currentKey] = currentValue.trim();
    }
  
    return {
      name: plantInfo['Name'] || '',
      scientificName: plantInfo['Scientific name'] || '',
      family: plantInfo['Family'] || '',
      description: plantInfo['Brief description'] || '',
      careTips: {
        watering: plantInfo['Care Tips']?.split('\n')[0] || '',
        sunlight: plantInfo['Care Tips']?.split('\n')[1] || '',
        soil: plantInfo['Care Tips']?.split('\n')[2] || '',
        fertilizer: plantInfo['Care Tips']?.split('\n')[3] || '',
      },
    };
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-6">Plant Identifier</h1>
      <div className="mb-8">
        <div className="flex flex-col items-center mb-4 gap-4">
          <label 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer" 
            htmlFor="upload-input"
          >
            Upload Image
            <input 
              id="upload-input"
              type="file" 
              className="hidden" 
              onChange={handleImageUpload} 
              accept="image/*" 
              aria-label="Upload an image"
            />
          </label>
          <button
            onClick={handleCameraCapture}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
            aria-label="Capture image using camera"
          >
            <Camera className="mr-2" /> Capture Image
          </button>
        </div>
        {image && (
          <div className="mt-4 flex justify-center">
            <img 
              src={image} 
              alt="Uploaded plant" 
              className="max-w-full h-auto rounded-lg shadow-md border-2 border-green-500"
              aria-live="polite"
            />
          </div>
        )}
        {loading && (
          <div className="text-center mt-4">
            <p className="mb-2">Identifying plant...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid mx-auto"></div>
          </div>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
      {identifiedPlant && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Identified Plant</h2>
          <div className="bg-white border border-green-200 rounded-lg p-4 shadow-inner">
            <p className="text-xl font-semibold text-green-700 mb-2">{identifiedPlant.name}</p>
            <p className="text-gray-800 mb-2">
              <strong className="text-green-600">Scientific Name:</strong> {identifiedPlant.scientificName}
            </p>
            <p className="text-gray-800 mb-2">
              <strong className="text-green-600">Family:</strong> {identifiedPlant.family}
            </p>
            <p className="text-gray-800">{identifiedPlant.description}</p>
            {identifiedPlant.careTips && (
              <div className="p-4 bg-yellow-50 rounded-lg shadow-md mt-4">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Care Tips</h3>
                <p className="text-gray-800"><strong>Watering:</strong> {identifiedPlant.careTips.watering}</p>
                <p className="text-gray-800"><strong>Sunlight:</strong> {identifiedPlant.careTips.sunlight}</p>
                <p className="text-gray-800"><strong>Soil:</strong> {identifiedPlant.careTips.soil}</p>
                <p className="text-gray-800"><strong>Fertilizer:</strong> {identifiedPlant.careTips.fertilizer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}