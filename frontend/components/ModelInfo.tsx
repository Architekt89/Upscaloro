"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ModelFeature {
  name: string;
  description: string;
}

interface ModelInfo {
  name: string;
  id: string;
  description: string;
  modes: string[];
  features: string[];
  best_for: string[];
  paper_url?: string;
  github_url?: string;
}

interface PlatformInfo {
  name: string;
  description: string;
  website: string;
  documentation: string;
}

interface ModelsResponse {
  models: {
    [key: string]: ModelInfo;
  };
  platform: PlatformInfo;
  version: string;
}

const ModelInfo: React.FC = () => {
  const [modelsData, setModelsData] = useState<ModelsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('real_esrgan');

  useEffect(() => {
    const fetchModelsInfo = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/models`);
        setModelsData(response.data);
      } catch (error) {
        console.error('Error fetching models info:', error);
        toast.error('Failed to load models information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelsInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!modelsData) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        Failed to load models information. Please try again later.
      </div>
    );
  }

  const { models, platform } = modelsData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Models</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Upscalor uses Replicate's Clarity Upscaler, a state-of-the-art AI model to upscale your images with exceptional quality.
        </p>

        {/* Model Content */}
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Clarity Upscaler</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A powerful AI upscaling model that offers multiple specialized modes for different types of images.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  {models.real_esrgan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Best For</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  {models.real_esrgan.best_for.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Available Modes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Block Mode</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    General purpose upscaling using epicrealism_naturalSinRC1VAE model. Best for most images.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Face Mode</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Face-focused upscaling using juggernaut_reborn model. Best for portraits and images with faces.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Waifu Mode</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Anime-style upscaling using flat2DAnimerge_v45Sharp model. Best for anime/cartoon images.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {models.real_esrgan.github_url && (
                <a
                  href={models.real_esrgan.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  GitHub Repository
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              
              <a
                href={`https://replicate.com/philz1337x/clarity-upscaler`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
              >
                View on Replicate
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Powered by{' '}
              <a
                href={platform.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                {platform.name}
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {platform.description}
            </p>
          </div>
          <a
            href={platform.documentation}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModelInfo; 