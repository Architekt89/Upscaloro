"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import ImageComparisonSlider from './ImageComparisonSlider';

interface ImageUploaderProps {
  userSubscription: 'free' | 'pro';
  imagesProcessedThisMonth: number;
  maxImagesPerMonth: number;
}

// Define valid parameter values
const VALID_MODES = ["block_mode", "face_mode", "waifu_mode"];
const VALID_SCALE_FACTORS = [2, 4, 6, 8, 16];
const VALID_OUTPUT_FORMATS = ["jpeg", "png", "jpg", "webp"];

// User-friendly names for modes
const MODE_NAMES = {
  block_mode: "Block Mode",
  face_mode: "Face Mode",
  waifu_mode: "Waifu Mode"
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  userSubscription,
  imagesProcessedThisMonth,
  maxImagesPerMonth,
}) => {
  const { user, session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [mode, setMode] = useState<string>("block_mode");
  const [dynamic, setDynamic] = useState<number>(25);
  const [handfix, setHandfix] = useState<boolean>(false);
  const [creativity, setCreativity] = useState<number>(0.5);
  const [resemblance, setResemblance] = useState<number>(1.5);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [options, setOptions] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);
  const [modeDescriptions, setModeDescriptions] = useState<Record<string, string>>({});

  // Fetch available options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('Fetching upscale options from:', `${process.env.NEXT_PUBLIC_API_URL}/upscale/options`);
        console.log('Auth status:', {
          isAuthenticated: !!user,
          hasSession: !!session,
          userEmail: user?.email,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry'
        });
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upscale/options`);
        console.log('Upscale options response:', response.data);
        setOptions(response.data);
        
        // Set mode descriptions if available
        if (response.data.mode_descriptions) {
          setModeDescriptions(response.data.mode_descriptions);
        }
        
        // Check if we have a powered_by field
        if (response.data.powered_by) {
          console.log(`Image processing powered by: ${response.data.powered_by}`);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response 
            ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
            : error.message;
          toast.error(`Error loading upscale options: ${errorMessage}`);
        } else {
          toast.error('Error loading upscale options');
        }
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [user, session]);

  // Update state variables to match the backend options format
  useEffect(() => {
    if (options) {
      // Set default values from options
      if (options.dynamic_range) {
        setDynamic(options.dynamic_range.default);
      }
      
      if (options.creativity) {
        setCreativity(options.creativity.default);
      }
      
      if (options.resemblance) {
        setResemblance(options.resemblance.default);
      }
    }
  }, [options]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setProcessedImage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    if (!user || !session) {
      toast.error('You must be logged in to process images');
      return;
    }

    if (imagesProcessedThisMonth >= maxImagesPerMonth) {
      toast.error(`You've reached your limit of ${maxImagesPerMonth} images this month. Please upgrade to continue.`);
      return;
    }

    // Check if user is on free plan and trying to use pro features
    if (userSubscription === 'free' && scaleFactor > 2) {
      toast.error('Scale factors above 2x are only available on the Pro plan');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scale_factor', scaleFactor.toString());
    formData.append('mode', mode);
    formData.append('dynamic', dynamic.toString());
    formData.append('handfix', handfix.toString());
    formData.append('creativity', creativity.toString());
    formData.append('resemblance', resemblance.toString());
    formData.append('output_format', outputFormat);

    console.log('Processing image with parameters:', {
      scale_factor: scaleFactor,
      mode,
      dynamic,
      handfix,
      creativity,
      resemblance,
      output_format: outputFormat
    });
    
    console.log('Auth status before upload:', {
      isAuthenticated: !!user,
      hasSession: !!session,
      userEmail: user?.email,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry',
      hasToken: !!session?.access_token,
      tokenLength: session?.access_token?.length
    });

    try {
      const loadingToast = toast.loading('Sending image to Replicate AI for processing. This may take a minute...');
      
      const response = await uploadFile('/upscale', formData);
      console.log('Upload response received:', {
        status: response.status,
        headers: response.headers,
        dataType: response.data ? typeof response.data : 'no data',
        dataSize: response.data ? 'has data' : 'no data'
      });

      const processedImageUrl = URL.createObjectURL(response.data);
      setProcessedImage(processedImageUrl);
      toast.success('Image processed successfully with Replicate AI!');
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Error processing image:', error);
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMessage = typeof errorData === 'string' ? errorData : 
                           errorData?.detail || error.message;
        
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        // Provide more user-friendly error messages
        if (error.response?.status === 500) {
          toast.error('The AI service encountered an error. Please try again or use a different image.');
        } else if (error.response?.status === 403) {
          toast.error(errorMessage || 'You need to upgrade your plan to use this feature.');
        } else if (error.response?.status === 401) {
          toast.error('Your session has expired. Please log in again.');
        } else if (error.response?.status === 400) {
          toast.error(errorMessage || 'Invalid parameters provided. Please check your settings.');
        } else {
          toast.error(errorMessage || 'Error processing image. Please try again.');
        }
      } else {
        toast.error('Error processing image. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `upscaled_${file?.name || 'image'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Image</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {imagesProcessedThisMonth} / {maxImagesPerMonth} images processed this month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 hover:border-primary-500'
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Drag & drop an image here, or click to select
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {/* Mode Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode
              </Label>
              <Select
                value={mode}
                onValueChange={(value) => setMode(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODE_NAMES[m as keyof typeof MODE_NAMES]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {modeDescriptions[mode] || 
                  "Block Mode: General purpose, Face Mode: Optimized for faces, Waifu Mode: Optimized for anime"}
              </p>
            </div>

            {/* Scale Factor */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Scale Factor
              </Label>
              <Select
                value={scaleFactor.toString()}
                onValueChange={(value) => setScaleFactor(parseInt(value))}
                disabled={userSubscription !== 'pro' && parseInt(scaleFactor.toString()) !== 2}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Scale Factor" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_SCALE_FACTORS.map((sf) => (
                    <SelectItem 
                      key={sf} 
                      value={sf.toString()}
                      disabled={userSubscription !== 'pro' && sf !== 2}
                    >
                      {sf}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userSubscription !== 'pro' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Scale factors above 2x are only available on the Pro plan
                </p>
              )}
            </div>

            {/* Output Format */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Output Format
              </Label>
              <Select
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Output Format" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_OUTPUT_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Range */}
            <div>
              <div className="flex justify-between">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dynamic Range
                </Label>
                <span className="text-sm text-gray-500">{dynamic}</span>
              </div>
              <Slider
                value={[dynamic]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => setDynamic(value[0])}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {options?.dynamic_range?.description || "Controls the dynamic range of the output image"}
              </p>
            </div>

            {/* Creativity */}
            <div>
              <div className="flex justify-between">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Creativity
                </Label>
                <span className="text-sm text-gray-500">{creativity.toFixed(1)}</span>
              </div>
              <Slider
                value={[creativity]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setCreativity(value[0])}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {options?.creativity?.description || "Controls the creativity level of the AI"}
              </p>
            </div>

            {/* Resemblance */}
            <div>
              <div className="flex justify-between">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Resemblance
                </Label>
                <span className="text-sm text-gray-500">{resemblance.toFixed(1)}</span>
              </div>
              <Slider
                value={[resemblance]}
                min={0}
                max={3}
                step={0.1}
                onValueChange={(value) => setResemblance(value[0])}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {options?.resemblance?.description || "Controls how closely the output resembles the input"}
              </p>
            </div>

            {/* Handfix */}
            <div className="flex items-center">
              <Switch
                id="handfix"
                checked={handfix}
                onCheckedChange={setHandfix}
              />
              <Label
                htmlFor="handfix"
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Improve Hand Details
              </Label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {options?.handfix?.description || "Improves the quality of hands in the output image"}
            </p>

            <button
              type="button"
              onClick={handleProcess}
              disabled={!file || isProcessing || imagesProcessedThisMonth >= maxImagesPerMonth}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                (!file || isProcessing || imagesProcessedThisMonth >= maxImagesPerMonth)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Process Image'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Result</h3>
          <div className="border-2 border-gray-300 rounded-lg p-6">
            {processedImage && preview ? (
              <div className="space-y-4 w-full">
                <ImageComparisonSlider
                  beforeImage={preview}
                  afterImage={processedImage}
                  className="w-full"
                />
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Download Result
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                {isProcessing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                    <p>Processing with AI...</p>
                  </div>
                ) : (
                  <p>Processed image will appear here</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {options?.powered_by && (
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by {options.powered_by} {options.api_version && `v${options.api_version}`}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 