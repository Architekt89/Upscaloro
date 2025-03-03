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
        // Extract error message from response
        let errorMessage = 'Error processing image. Please try again.';
        
        if (error.response?.data) {
          // Try to extract the error message from the response
          if (error.response.data instanceof Blob) {
            try {
              // Convert blob to text
              const blobText = await error.response.data.text();
              const errorData = JSON.parse(blobText);
              errorMessage = errorData.detail || errorMessage;
            } catch (e) {
              console.error('Error parsing error blob:', e);
            }
          } else if (typeof error.response.data === 'object') {
            errorMessage = error.response.data.detail || errorMessage;
          } else if (typeof error.response.data === 'string') {
            try {
              const errorData = JSON.parse(error.response.data);
              errorMessage = errorData.detail || errorMessage;
            } catch (e) {
              errorMessage = error.response.data;
            }
          }
        }
        
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          errorMessage,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        // Provide more user-friendly error messages
        if (error.response?.status === 500) {
          toast.error(errorMessage || 'The AI service encountered an error. Please try again or use a different image.');
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
      
      // Always dismiss the loading toast
      toast.dismiss();
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
    <div className="grid grid-cols-4 gap-8">
      {/* Left Section - Parameters and Upload (1/4 width) */}
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold mb-2">Upload Image</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {imagesProcessedThisMonth} / {maxImagesPerMonth} images processed this month
          </p>
          
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <input {...getInputProps()} />
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={200}
                height={200}
                className="mx-auto object-contain"
              />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p>Drag & drop an image here, or click to select</p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {VALID_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {MODE_NAMES[m as keyof typeof MODE_NAMES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modeDescriptions[mode] && (
              <p className="text-sm text-gray-500 mt-1">{modeDescriptions[mode]}</p>
            )}
          </div>

          <div>
            <Label>Scale Factor</Label>
            <Select value={scaleFactor.toString()} onValueChange={(v) => setScaleFactor(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select scale factor" />
              </SelectTrigger>
              <SelectContent>
                {VALID_SCALE_FACTORS.map((factor) => (
                  <SelectItem
                    key={factor}
                    value={factor.toString()}
                    disabled={userSubscription === 'free' && factor > 2}
                  >
                    {factor}x {userSubscription === 'free' && factor > 2 && '(Pro)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Output Format</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select output format" />
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

          <div>
            <Label>Dynamic Range ({dynamic})</Label>
            <Slider
              value={[dynamic]}
              onValueChange={([value]) => setDynamic(value)}
              min={1}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Creativity ({creativity})</Label>
            <Slider
              value={[creativity]}
              onValueChange={([value]) => setCreativity(value)}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Resemblance ({resemblance})</Label>
            <Slider
              value={[resemblance]}
              onValueChange={([value]) => setResemblance(value)}
              min={0}
              max={3}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={handfix}
              onCheckedChange={setHandfix}
              id="handfix"
            />
            <Label htmlFor="handfix">Improve hand details</Label>
          </div>

          <button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Image'}
          </button>
        </div>
      </div>

      {/* Right Section - Result (3/4 width) */}
      <div className="col-span-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Result</h2>
        {preview && processedImage ? (
          <div className="space-y-4">
            <ImageComparisonSlider
              beforeImage={preview}
              afterImage={processedImage}
              className="w-full h-[700px] rounded-lg overflow-hidden"
            />
            <button
              onClick={handleDownload}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Download Result
            </button>
          </div>
        ) : (
          <div className="h-[700px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500">Processed image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 