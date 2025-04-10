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

export default function ImageUpload({ setIdentifiedPlant }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploaded file:', file);
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
        console.log('Base64 image data:', base64data);

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
        });

        const result = await model.generateContent([
          'Identify this plant and provide the following information:',
          'name, scientific name, family, brief description, and care tips including watering, sunlight, soil, and fertilizer requirements.',
          ...imageParts,
        ]);

        if (result.response && typeof result.response.text === 'function') {
          const responseText = await result.response.text();
          console.log('API response text:', responseText);

          const plantInfo = parsePlantInfo(responseText);
          console.log('Parsed plant info:', plantInfo);

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
    const lines = responseText.split('\n');
    const info: Partial<IdentifiedPlant> = {};
    const careTips: Partial<IdentifiedPlant["careTips"]> = {};
  
    for (let line of lines) {
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey?.trim().toLowerCase();
      const value = rest.join(':').trim();
  
      if (!key || !value) continue;
  
      switch (key) {
        case 'name':
          info.name = value;
          break;
        case 'scientific name':
          info.scientificName = value;
          break;
        case 'family':
          info.family = value;
          break;
        case 'description':
        case 'brief description':
          info.description = value;
          break;
        case 'watering':
          careTips.watering = value;
          break;
        case 'sunlight':
          careTips.sunlight = value;
          break;
        case 'soil':
          careTips.soil = value;
          break;
        case 'fertilizer':
          careTips.fertilizer = value;
          break;
        default:
          break;
      }
    }
  
    if (!info.name || !info.scientificName || !info.family || !info.description) {
      throw new Error("Missing required plant information from AI response");
    }
  
    info.careTips = {
      watering: careTips.watering || '',
      sunlight: careTips.sunlight || '',
      soil: careTips.soil || '',
      fertilizer: careTips.fertilizer || ''
    };
  
    return info as IdentifiedPlant;
  };
  

  return (
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
  );
}