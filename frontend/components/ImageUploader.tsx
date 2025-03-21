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
  userSubscription: 'free' | 'pro' | 'enterprise';
  imagesProcessedThisMonth: number;
  maxImagesPerMonth: number;
  isLoading?: boolean;  // Optional prop to indicate data is loading
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

// Default mode descriptions (simplified versions)
const DEFAULT_MODE_DESCRIPTIONS = {
  block_mode: "Best for most images.",
  face_mode: "Best for portraits and images with faces.",
  waifu_mode: "Best for anime/cartoon images."
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  userSubscription,
  imagesProcessedThisMonth,
  maxImagesPerMonth,
  isLoading = false,  // Default to false
}) => {
  const { user, session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [batchPreviews, setBatchPreviews] = useState<string[]>([]);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [batchProcessedImages, setBatchProcessedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [mode, setMode] = useState<string>("block_mode");
  const [dynamic, setDynamic] = useState<number>(25);
  const [handfix, setHandfix] = useState<boolean>(false);
  const [creativity, setCreativity] = useState<number>(0.5);
  const [resemblance, setResemblance] = useState<number>(1.5);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [options, setOptions] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);
  const [modeDescriptions, setModeDescriptions] = useState<Record<string, string>>(DEFAULT_MODE_DESCRIPTIONS);

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

  // Use this effect to reset mode to block_mode if user downgrades from pro/enterprise to free
  useEffect(() => {
    if (userSubscription === 'free' && (mode === 'face_mode' || mode === 'waifu_mode')) {
      setMode('block_mode');
      toast.error('Face Mode and Waifu Mode are only available on paid plans');
    }
  }, [userSubscription, mode]);

  // Use this effect to reset scale factor if user downgrades
  useEffect(() => {
    if (userSubscription === 'free' && scaleFactor > 2) {
      setScaleFactor(2);
      toast.error('Scale factors above 2x are only available on paid plans');
    } else if (userSubscription === 'pro' && scaleFactor > 4) {
      setScaleFactor(4);
      toast.error('Scale factors above 4x are only available on Enterprise plan');
    }
  }, [userSubscription, scaleFactor]);

  // Update the onDrop callback to handle multiple files for Pro and Enterprise users
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (userSubscription === 'free') {
      // Free users can only upload one file at a time
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setProcessedImage(null);
        // Reset batch mode
        setBatchMode(false);
        setBatchFiles([]);
        setBatchPreviews([]);
        setBatchProcessedImages([]);
      }
    } else {
      // Pro and Enterprise users can upload multiple files
      if (acceptedFiles.length === 1 && !batchMode) {
        // Single file upload mode
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        setProcessedImage(null);
      } else {
        // Batch mode
        setBatchMode(true);
        setBatchFiles(prev => {
          // Limit to 10 files max to prevent performance issues
          const newFiles = [...prev, ...acceptedFiles].slice(0, 10);
          
          // Create preview URLs for each file
          const newPreviews = newFiles.map(file => URL.createObjectURL(file));
          setBatchPreviews(newPreviews);
          
          return newFiles;
        });
        
        // Reset single file state
        setFile(null);
        setPreview(null);
        setProcessedImage(null);
      }
    }
  }, [userSubscription, batchMode]);

  // Update the dropzone configuration to allow multiple files for Pro and Enterprise users
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: userSubscription === 'free' ? 1 : 10,
    multiple: userSubscription !== 'free',
  });
  
  // Add a function to remove a file from batch files
  const removeFromBatch = (index: number) => {
    setBatchFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      
      // Also update previews
      setBatchPreviews(prev => {
        const newPreviews = [...prev];
        URL.revokeObjectURL(newPreviews[index]); // Clean up URL
        newPreviews.splice(index, 1);
        return newPreviews;
      });
      
      // Also update processed images if any
      if (batchProcessedImages.length > index) {
        setBatchProcessedImages(prev => {
          const newProcessed = [...prev];
          if (newProcessed[index]) {
            URL.revokeObjectURL(newProcessed[index]); // Clean up URL
          }
          newProcessed.splice(index, 1);
          return newProcessed;
        });
      }
      
      // If no files left, reset batch mode
      if (newFiles.length === 0) {
        setBatchMode(false);
      }
      
      return newFiles;
    });
  };
  
  // Add function to toggle batch mode for Pro and Enterprise users
  const toggleBatchMode = () => {
    if (userSubscription === 'free') {
      toast.error('Batch processing is only available for Pro and Enterprise plans');
      return;
    }
    
    setBatchMode(!batchMode);
    if (!batchMode) {
      // Switching to batch mode - clear single file state
      setFile(null);
      setPreview(null);
      setProcessedImage(null);
    } else {
      // Switching to single mode - clear batch state
      setBatchFiles([]);
      setBatchPreviews([]);
      setBatchProcessedImages([]);
    }
  };

  // Add batch processing function
  const handleBatchProcess = async () => {
    if (batchFiles.length === 0) {
      toast.error('Please upload at least one image first');
      return;
    }

    if (!user || !session) {
      toast.error('You must be logged in to process images');
      return;
    }
    
    // Check if the selected mode is allowed for the user's subscription
    if (userSubscription === 'free' && mode !== 'block_mode') {
      toast.error('Face Mode and Waifu Mode are only available on paid plans');
      return;
    }
    
    // Check if the selected scale factor is allowed for the user's subscription
    if (userSubscription === 'free' && scaleFactor > 2) {
      toast.error('Scale factors above 2x are only available on paid plans');
      return;
    } else if (userSubscription === 'pro' && scaleFactor > 4) {
      toast.error('Scale factors above 4x are only available on Enterprise plan');
      return;
    }
    
    // Check if there are enough remaining images for the user's plan
    const totalToProcess = batchFiles.length;
    
    if (userSubscription === 'pro') {
      const remaining = maxImagesPerMonth - imagesProcessedThisMonth;
      if (totalToProcess > remaining) {
        toast.error(`You only have ${remaining} images left in your monthly limit. Please reduce batch size or upgrade to Enterprise for unlimited processing.`);
        return;
      }
    }
    
    setIsBatchProcessing(true);
    setBatchProgress(0);
    setBatchProcessedImages([]);
    
    const loadingToast = toast.loading(`Processing ${batchFiles.length} images... This may take a while.`);
    
    try {
      // Process images one by one
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scale_factor', scaleFactor.toString());
        formData.append('mode', mode);
        formData.append('dynamic', dynamic.toString());
        formData.append('handfix', handfix.toString());
        formData.append('creativity', creativity.toString());
        formData.append('resemblance', resemblance.toString());
        formData.append('output_format', outputFormat);
        
        // Update progress indicator
        setBatchProgress(Math.round(((i) / batchFiles.length) * 100));
        toast.loading(`Processing image ${i + 1} of ${batchFiles.length}... (${Math.round(((i) / batchFiles.length) * 100)}%)`, 
          { id: loadingToast });
        
        try {
          const response = await uploadFile('/upscale', formData);
          const processedImageUrl = URL.createObjectURL(response.data);
          
          // Add to processed images array
          setBatchProcessedImages(prev => [...prev, processedImageUrl]);
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          if (axios.isAxiosError(error) && error.response?.data) {
            let errorMessage = 'Processing failed';
            if (typeof error.response.data === 'object') {
              errorMessage = error.response.data.detail || errorMessage;
            } else if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            }
            
            // Add placeholder for failed image
            setBatchProcessedImages(prev => [...prev, '']);
            toast.error(`Failed to process image ${i + 1}: ${errorMessage}`);
          }
        }
      }
      
      setBatchProgress(100);
      toast.success(`Successfully processed ${batchProcessedImages.length} out of ${batchFiles.length} images!`, 
        { id: loadingToast });
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('Batch processing failed', { id: loadingToast });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Add batch download function
  const handleBatchDownload = async () => {
    if (batchProcessedImages.length === 0) {
      toast.error('No processed images available to download');
      return;
    }
    
    toast.loading('Preparing downloads...');
    
    // Create a zip file of all processed images
    try {
      // Use dynamic import for the JSZip library
      try {
        // First check if JSZip is already available (it might be installed)
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        // Add each processed image to the zip
        for (let i = 0; i < batchProcessedImages.length; i++) {
          if (!batchProcessedImages[i]) continue; // Skip failed images
          
          const response = await fetch(batchProcessedImages[i]);
          const blob = await response.blob();
          
          // Get original filename without extension
          const originalName = batchFiles[i].name;
          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
          const extension = outputFormat.toLowerCase();
          const fileName = `upscaled_${baseName}.${extension}`;
          
          zip.file(fileName, blob);
        }
        
        // Generate the zip file
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `upscaloro_batch_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.dismiss();
        toast.success('Batch download started');
      } catch (importError) {
        // JSZip is not installed, fall back to individual downloads
        console.error('JSZip not available:', importError);
        throw new Error('JSZip library not available');
      }
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast.dismiss();
      toast.error('Failed to create zip file for download');
      
      // Fallback: Download each image individually
      toast.success('Downloading images individually instead...');
      for (let i = 0; i < batchProcessedImages.length; i++) {
        if (!batchProcessedImages[i]) continue; // Skip failed images
        
        const originalName = batchFiles[i].name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const extension = outputFormat.toLowerCase();
        const fileName = `upscaled_${baseName}.${extension}`;
        
        const link = document.createElement('a');
        link.href = batchProcessedImages[i];
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Add a small delay between downloads to avoid browser throttling
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    if (!user || !session) {
      toast.error('You must be logged in to process images');
      return;
    }
    
    // Check if the selected mode is allowed for the user's subscription
    if (userSubscription === 'free' && mode !== 'block_mode') {
      toast.error('Face Mode and Waifu Mode are only available on paid plans');
      return;
    }
    
    // Check if the selected scale factor is allowed for the user's subscription
    if (userSubscription === 'free' && scaleFactor > 2) {
      toast.error('Scale factors above 2x are only available on paid plans');
      return;
    } else if (userSubscription === 'pro' && scaleFactor > 4) {
      toast.error('Scale factors above 4x are only available on Enterprise plan');
      return;
    }

    // Use the options from the backend to determine limits
    if (options) {
      // Check if selected features are available for the user's plan
      if (options.scale_factors && !options.scale_factors.includes(scaleFactor)) {
        toast.error(`Scale factor ${scaleFactor}x is not available on your ${userSubscription} plan.`);
      return;
    }

      if (options.modes && !options.modes.includes(mode)) {
        toast.error(`${MODE_NAMES[mode as keyof typeof MODE_NAMES] || mode} is not available on your ${userSubscription} plan.`);
      return;
      }
    }

    // Check monthly usage limit
    if (userSubscription === 'free') {
      // The actual check will be done server-side for daily limit
      if (imagesProcessedThisMonth >= maxImagesPerMonth) {
        toast.error(`You've reached your daily limit of ${maxImagesPerMonth} images. Please upgrade to process more images.`);
        return;
      }
    } else if (userSubscription === 'pro') {
      if (imagesProcessedThisMonth >= maxImagesPerMonth) {
        toast.error(`You've reached your monthly limit of ${maxImagesPerMonth} images. Please upgrade to Enterprise for unlimited processing.`);
        return;
      }
    }
    // Enterprise has no limits to check

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
      const loadingToast = toast.loading('Processing... This may take a minute.');
      
      const response = await uploadFile('/upscale', formData);
      console.log('Upload response received:', {
        status: response.status,
        headers: response.headers,
        dataType: response.data ? typeof response.data : 'no data',
        dataSize: response.data ? 'has data' : 'no data'
      });

      const processedImageUrl = URL.createObjectURL(response.data);
      setProcessedImage(processedImageUrl);
      toast.success('Image processed successfully!');
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
    if (processedImage && file) {
      // Get the original file extension
      const originalName = file.name;
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      
      // Use the selected output format for the downloaded file
      const extension = outputFormat.toLowerCase();
      const fileName = `upscaled_${baseName}.${extension}`;
      
      // Create a fetch request to get the blob with the correct type
      fetch(processedImage)
        .then(response => response.blob())
        .then(blob => {
          // Create a new blob with the correct MIME type based on the output format
          let mimeType;
          switch (extension) {
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            case 'png':
            default:
              mimeType = 'image/png';
              break;
          }
          
          // Create a new blob with the correct MIME type
          const newBlob = new Blob([blob], { type: mimeType });
          const blobUrl = URL.createObjectURL(newBlob);
          
          // Create download link
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          
          toast.success(`Image downloaded as ${extension.toUpperCase()}`);
        })
        .catch(error => {
          console.error('Error downloading image:', error);
          toast.error('Failed to download image');
        });
    } else {
      toast.error('No processed image available to download');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
      {/* Left Section - Parameters and Upload (full width on mobile, 1/4 width on desktop) */}
      <div className="space-y-4 p-4 bg-[#171b24] rounded-lg">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Upload Image</h2>
            {isLoading ? (
              <div className="w-24 h-8 animate-pulse bg-gray-700 rounded-full"></div>
            ) : userSubscription === 'free' ? (
              <a 
                href="/pricing" 
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full text-white 
                bg-orange-500 hover:bg-orange-600
                transition-all duration-300"
              >
                Upgrade to Pro
              </a>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full text-white 
                bg-gray-700">
                {userSubscription === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="h-4 w-36 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm text-gray-400">
            {imagesProcessedThisMonth} / {maxImagesPerMonth} images processed this month
          </p>
          )}
          
          {/* Batch processing toggle for Pro and Enterprise users */}
          {userSubscription !== 'free' && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <Switch
                  checked={batchMode}
                  onCheckedChange={toggleBatchMode}
                  id="batchMode"
                />
                <Label htmlFor="batchMode" className="ml-2 text-sm text-gray-300">
                  Batch Processing Mode
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Process multiple images at once with the same settings.
              </p>
            </div>
          )}
        </div>
        
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 md:p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          <input {...getInputProps()} />
          {batchMode ? (
            <div className="space-y-2">
              {batchPreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {batchPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-contain max-h-[80px] w-auto mx-auto"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromBatch(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs h-5 w-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <svg
                      className="w-8 h-8 md:w-12 md:h-12 text-gray-400"
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
                  <p className="text-sm md:text-base">Drag & drop multiple images here, or click to select</p>
                  <p className="text-xs md:text-sm text-gray-500">PNG, JPG, WEBP up to 10MB each (max 10 files)</p>
                </div>
              )}
              <p className="text-sm text-orange-500 mt-2">
                {batchPreviews.length} {batchPreviews.length === 1 ? 'image' : 'images'} selected
                {batchPreviews.length < 10 && ' (click or drop to add more)'}
              </p>
            </div>
          ) : (
            // Single file upload view (existing code)
            preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              className="mx-auto object-contain max-h-[150px] md:max-h-[200px] w-auto"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <svg
                  className="w-8 h-8 md:w-12 md:h-12 text-gray-400"
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
              <p className="text-sm md:text-base">Drag & drop an image here, or click to select</p>
              <p className="text-xs md:text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
            </div>
            )
          )}
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
                  <SelectItem 
                    key={m} 
                    value={m}
                    disabled={userSubscription === 'free' && m !== 'block_mode'}
                  >
                    {MODE_NAMES[m as keyof typeof MODE_NAMES]}
                    {userSubscription === 'free' && m !== 'block_mode' && ' (Pro)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modeDescriptions[mode] && (
              <p className="text-xs md:text-sm text-gray-500 mt-1">{modeDescriptions[mode]}</p>
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
                    disabled={(userSubscription === 'free' && factor > 2) || 
                            (userSubscription === 'pro' && factor > 4)}
                  >
                    {factor}x {userSubscription === 'free' && factor > 2 ? 
                         (factor <= 4 ? '(Pro)' : '(Enterprise)') : 
                         (userSubscription === 'pro' && factor > 4 ? '(Enterprise)' : '')}
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

          {/* Processing button for single or batch mode */}
          {batchMode ? (
            <button
              onClick={handleBatchProcess}
              disabled={batchFiles.length === 0 || isBatchProcessing}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBatchProcessing ? `Processing... ${batchProgress}%` : `Process ${batchFiles.length} Images`}
            </button>
          ) : (
          <button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Image'}
          </button>
          )}
        </div>

        {/* Add usage information section */}
        <div className="mb-6 mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Plan Limits</h3>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Subscription:</span>
              <span className="font-medium capitalize">{userSubscription} Plan</span>
            </div>
            
            <div className="flex justify-between">
              <span>Monthly limit:</span>
              {userSubscription === 'free' ? (
                <span className="font-medium">5 images per month</span>
              ) : userSubscription === 'pro' ? (
                <span className="font-medium">400 images per month</span>
              ) : (
                <span className="font-medium">800 images per month</span>
              )}
            </div>
            
            <div className="flex justify-between">
              <span>Processed this month:</span>
              <span className="font-medium">{imagesProcessedThisMonth} images</span>
            </div>
            
            {userSubscription !== 'enterprise' && (
              <div className="mt-2 text-center">
                <a 
                  href="/pricing" 
                  className="text-orange-500 hover:text-orange-600 hover:underline"
                >
                  Upgrade your plan for more features
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Result (full width on mobile, 3/4 width on desktop) */}
      <div className="col-span-1 md:col-span-3 p-4 bg-[#171b24] rounded-lg">
        <h2 className="text-lg font-medium mb-3">Result</h2>
        
        {batchMode ? (
          // Batch results view
          <div className="space-y-4">
            {batchProcessedImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchProcessedImages.map((processedImage, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {processedImage ? (
                        <div className="relative">
                          {/* Before/After comparison using a simple hoverable approach */}
                          <div className="group relative h-[200px]">
                            {/* "Before" image (visible on hover) */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Image
                                src={batchPreviews[index]}
                                alt={`Original ${index + 1}`}
                                width={300}
                                height={200}
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Original
                              </div>
                            </div>
                            
                            {/* "After" image (default visible) */}
                            <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300">
                              <Image
                                src={processedImage}
                                alt={`Processed ${index + 1}`}
                                width={300}
                                height={200}
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Processed
                              </div>
                            </div>
                          </div>
                          
                          {/* Image filename */}
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs truncate">
                            {batchFiles[index].name}
                          </div>
                          
                          {/* Individual download button */}
                          <a 
                            href={processedImage}
                            download={`upscaled_${batchFiles[index].name}`}
                            className="block w-full text-center py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[200px] bg-red-100 dark:bg-red-900/30">
                          <p className="text-red-500 dark:text-red-400 text-sm px-4 text-center">
                            Processing failed for this image
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Batch download button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleBatchDownload}
                    className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Download All as ZIP
                  </button>
                </div>
              </>
            ) : (
              isBatchProcessing ? (
                <div className="h-[300px] md:h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Processing {batchFiles.length} images...</p>
                    <p className="text-gray-500 text-sm mt-2">{batchProgress}% complete</p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] md:h-[500px] lg:h-[700px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-500">Processed images will appear here</p>
                </div>
              )
            )}
          </div>
        ) : (
          // Single image result view (existing code)
          preview && processedImage ? (
          <div className="space-y-4">
            <ImageComparisonSlider
              beforeImage={preview}
              afterImage={processedImage}
              className="w-full h-[300px] md:h-[500px] lg:h-[700px] rounded-lg overflow-hidden"
            />
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Download Result
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[300px] md:h-[500px] lg:h-[700px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500">Processed image will appear here</p>
          </div>
          )
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 