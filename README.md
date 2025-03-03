# Upscalor - AI Image Upscaling SaaS

![Upscalor Logo](frontend/public/logo.png)

Upscalor is a SaaS application that uses AI to upscale and enhance images. It provides a user-friendly interface for image upscaling and batch processing, along with a robust API for developers.

## Features

- **AI-Powered Image Upscaling**: Enhance image resolution by 2x, 4x, 6x, 8x, or 16x using Replicate's AI models
- **Multiple Upscaling Modes**: 
  - **Block Mode**: General purpose upscaling using epicrealism_naturalSinRC1VAE model
  - **Face Mode**: Optimized for portraits using juggernaut_reborn model
  - **Waifu Mode**: Specialized for anime and cartoon images using flat2DAnimerge_v45Sharp model
- **Advanced Controls**: Fine-tune your results with dynamic, creativity, resemblance, and handfix parameters
- **Multiple Output Formats**: Save your upscaled images in JPEG, PNG, JPG, or WEBP formats
- **User-Friendly Interface**: Drag-and-drop interface for easy image uploading
- **Subscription Plans**: Free and Pro tiers with different feature sets
- **API Access**: RESTful API for developers to integrate image upscaling into their applications
- **Secure Authentication**: User authentication and authorization using Supabase
- **Payment Processing**: Subscription and pay-as-you-go billing using Stripe

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Dropzone
- Axios
- React Hot Toast
- Radix UI Components

### Backend
- FastAPI
- Python 3.9+
- Replicate API for AI image upscaling
  - Real-ESRGAN model for general purpose and face-focused upscaling
  - Waifu Diffusion model for anime-style upscaling
- JWT Authentication
- Supabase for database and storage
- Stripe for payment processing

## Project Structure

```
upscalor/
├── frontend/               # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── public/             # Static assets
│   └── ...
├── backend/                # FastAPI backend application
│   ├── image_processor.py  # Image processing logic
│   ├── main.py             # FastAPI application
│   ├── supabase_setup.sql  # Database setup SQL
│   ├── stripe_setup.md     # Stripe setup guide
│   └── ...
├── deployment_guide.md     # Deployment instructions
└── README.md               # This file
```

## Environment Variables

Upscalor requires environment variables to be set in both the frontend and backend. To simplify this process, we've included a script that synchronizes environment variables between the frontend and backend.

### Automatic Synchronization

When you run the setup script, it will automatically synchronize the Supabase credentials from your frontend/.env to the backend/.env and root .env files:

```bash
./setup.sh
```

You can also run the synchronization separately:

```bash
./setup_env.sh
```

### Important Environment Variables

- **SUPABASE_JWT_SECRET**: Required for authentication between the frontend and backend
- **REPLICATE_API_TOKEN**: Required for the image upscaling functionality
- **STRIPE_API_KEY**: Required for payment processing (if using Stripe)

Make sure these variables are set in your environment files before running the application.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Stripe account
- Replicate API token

### Quick Setup

The easiest way to set up the project is to use the provided setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check for required dependencies
2. Create environment files if they don't exist
3. Set up the Python virtual environment and install backend dependencies
4. Install frontend dependencies

### Manual Setup

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in the `.env` file with your Supabase and Stripe credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Update the environment variables in the `.env` file with your Supabase, Stripe, and Replicate credentials.

6. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

7. The API will be available at [http://localhost:8000](http://localhost:8000).

### Database Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).

2. Run the SQL setup script in the Supabase SQL Editor:
   - Copy the contents of `backend/supabase_setup.sql`
   - Paste into the SQL Editor and run

3. Create a storage bucket named "images" in the Supabase dashboard.

4. Get your JWT secret for authentication:
   - Go to Project Settings > API
   - Copy the JWT Secret
   - Add it to your environment variables as `SUPABASE_JWT_SECRET`

### Stripe Setup

Follow the instructions in `backend/stripe_setup.md` to set up Stripe for payments.

### Replicate Setup

1. Create an account at [https://replicate.com](https://replicate.com).
2. Generate an API token from your account settings.
3. Add the API token to your `.env` file as `REPLICATE_API_TOKEN`.

## Upscaling Parameters

Upscalor uses Replicate's AI models with the following parameters:

- **Mode**: 
  - **Block Mode**: General purpose upscaling using Real-ESRGAN model
  - **Face Mode**: Optimized for portraits using Real-ESRGAN with face enhancement
  - **Waifu Mode**: Optimized for anime/manga images using Waifu Diffusion model

- **Scale Factor**: 2x, 4x, 6x, 8x, or 16x

- **Dynamic Range**: Controls the dynamic range of the upscaled image (1-50)
  Higher values increase contrast and detail in the output image.

- **Creativity**: Controls the creativity level of the AI (0-1)
  Higher values produce more creative results but may be less accurate to the original.

- **Resemblance**: Controls how closely the result resembles the original (0-3)
  Higher values produce results more similar to the original image.

- **Handfix**: Improves hand details in the upscaled image (enabled/disabled)
  Particularly useful for images containing hands, which AI models sometimes struggle with.

- **Output Format**: JPEG, PNG, JPG, or WEBP

## Replicate AI Models

Upscalor uses Replicate's Clarity Upscaler AI model:

- **Clarity Upscaler**
  - Model ID: `philz1337x/clarity-upscaler`
  - Features: High-quality image upscaling with multiple specialized modes
  - Modes:
    - **Block Mode (epicrealism_naturalSinRC1VAE)**: General purpose upscaling, best for most images
    - **Face Mode (juggernaut_reborn)**: Optimized for portraits and images with faces
    - **Waifu Mode (flat2DAnimerge_v45Sharp)**: Specialized for anime and cartoon-style images

The model offers advanced parameters for fine-tuning results:
- **Dynamic Range**: Controls the dynamic range of the output (1-50)
- **Creativity**: Controls the creativity level of the AI (0-1)
- **Resemblance**: Controls how closely the result resembles the original (0-3)
- **Handfix**: Improves hand details in the upscaled image

## Handling Large Files

This project uses libraries that include large binary files (>100MB) which exceed GitHub's file size limits. We've provided tools to help manage these files:

1. **Use the provided `.gitignore`**: The repository includes a `.gitignore` file that excludes large files and directories like `backend/venv/` and `frontend/node_modules/`.

2. **If you've already committed large files**: Use the cleanup script to remove them from Git history:
   ```bash
   chmod +x cleanup_large_files.sh
   ./cleanup_large_files.sh
   ```

3. **For more information**: See the detailed guide in `git_large_files_guide.md`.

## Deployment

For detailed deployment instructions, see [deployment_guide.md](deployment_guide.md).

## API Documentation

API documentation is available at `/api-docs` when the application is running. It includes:

- Authentication
- Endpoints
- Request/response formats
- Rate limits
- Pricing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Replicate](https://replicate.com/) - AI model hosting platform
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs
- [Next.js](https://nextjs.org/) - React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Stripe](https://stripe.com/) - Payment processing platform

---

# Large binary files
backend/venv/
frontend/node_modules/

# Python virtual environment
backend/venv/
__pycache__/
*.py[cod]
*$py.class

# Node.js dependencies
frontend/node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
