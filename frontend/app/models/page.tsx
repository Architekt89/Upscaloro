import ModelInfo from '@/components/ModelInfo';

export default function ModelsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Models</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Learn about the advanced AI models that power Upscalor's image upscaling capabilities.
      </p>
      <ModelInfo />
    </div>
  );
} 