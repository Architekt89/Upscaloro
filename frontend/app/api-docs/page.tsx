export default function ApiDocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Upscalor API</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Integrate AI-powered image upscaling into your applications with our RESTful API.
          </p>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Authentication</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All API requests require authentication using a JWT token or API key.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example request with API key
fetch('https://api.upscalor.com/upscale', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
})`}
                </code>
              </pre>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Endpoints</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">POST /upscale</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Upscale an image using AI.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code>
                    {`// Request (multipart/form-data)
{
  file: [binary image data],
  scale_factor: 2,  // 2, 4, 6, 8, or 16
  mode: "block_mode",  // block_mode, face_mode, or waifu_mode
  dynamic: 25,  // 1-50
  handfix: false,
  creativity: 0.5,  // 0-1
  resemblance: 1.5,  // 0-3
  output_format: "png"  // png, jpg, jpeg, or webp
}`}
                  </code>
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">GET /upscale/options</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Get available upscale options.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code>
                    {`// Response
{
  "modes": ["block_mode", "face_mode", "waifu_mode"],
  "mode_descriptions": {
    "block_mode": "General purpose upscaling using Real-ESRGAN model...",
    "face_mode": "Face-focused upscaling using Real-ESRGAN with face enhancement...",
    "waifu_mode": "Anime-style upscaling using Waifu Diffusion model..."
  },
  "scale_factors": [2, 4, 6, 8, 16],
  "output_formats": ["jpeg", "png", "jpg", "webp"],
  "dynamic_range": {"min": 1, "max": 50, "default": 25, "description": "..."},
  "creativity": {"min": 0, "max": 1, "default": 0.5, "description": "..."},
  "resemblance": {"min": 0, "max": 3, "default": 1.5, "description": "..."},
  "handfix": {"description": "..."},
  "powered_by": "Replicate AI",
  "api_version": "1.1.0"
}`}
                  </code>
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-2">GET /models</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Get information about the AI models used for image upscaling.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code>
                    {`// Response
{
  "models": {
    "real_esrgan": {
      "name": "Real-ESRGAN",
      "id": "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      "description": "A state-of-the-art image upscaling model...",
      "modes": ["block_mode", "face_mode"],
      "features": ["High-quality image upscaling", "Preserves fine details", ...],
      "best_for": ["Photographs", "Realistic images", "Portraits", "Landscapes"],
      "paper_url": "https://arxiv.org/abs/2107.10833",
      "github_url": "https://github.com/xinntao/Real-ESRGAN"
    },
    "waifu_diffusion": {
      "name": "Waifu Diffusion",
      "id": "cjwbw/waifu-diffusion:25d2f75ecda0c0bed34c806b7b70319a53a1bccad3e76902eacd3063f412330b",
      "description": "A specialized model for upscaling anime and cartoon-style images...",
      "modes": ["waifu_mode"],
      "features": ["Specialized for anime and cartoon images", ...],
      "best_for": ["Anime", "Manga", "Cartoons", "Illustrations"],
      "github_url": "https://github.com/harubaru/waifu-diffusion"
    }
  },
  "platform": {
    "name": "Replicate",
    "description": "A platform that makes it easy to run machine learning models in the cloud.",
    "website": "https://replicate.com",
    "documentation": "https://replicate.com/docs"
  },
  "version": "1.1.0"
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              API usage is subject to the following rate limits:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Free tier:</strong> 3 requests per month, max 2x scale factor</li>
              <li><strong>Pro tier:</strong> 100 requests per month, all scale factors</li>
              <li><strong>Enterprise tier:</strong> Custom limits, contact us for details</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Get Your API Key</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To get started with the Upscalor API, sign up for a Pro or Enterprise plan and generate your API key from the dashboard.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 