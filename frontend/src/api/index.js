// Use environment variables for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com';

// When fetching images
const getImageUrl = (imageId) => `${API_URL}/images/${imageId}`; 