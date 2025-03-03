# Changelog

## v3.0.0 - 2023-08-20

### Major Changes

#### Migrated to Replicate's Clarity Upscaler

- Replaced previous models with Replicate's Clarity Upscaler
- Updated model mappings:
  - Block Mode now uses epicrealism_naturalSinRC1VAE
  - Face Mode now uses juggernaut_reborn
  - Waifu Mode now uses flat2DAnimerge_v45Sharp
- Improved parameter handling for better results
- Updated documentation and UI to reflect new model capabilities

#### Backend Changes

- Updated `image_processor.py` to use Clarity Upscaler API
- Modified parameter handling for new model requirements
- Improved error handling and validation
- Updated model information endpoint

#### Frontend Changes

- Updated ModelInfo component to display new model information
- Adjusted UI to better explain the different modes
- Updated documentation and help text

## v2.0.0 - 2023-07-15

### Major Changes

#### Migrated from Upscayl/GFPGAN to Replicate API

- Removed all dependencies related to Upscayl and GFPGAN
- Integrated with Replicate's Clarity Upscaler API
- Added support for multiple upscaling modes (Block Mode, Face Mode, Waifu Mode)
- Added support for more scale factors (2x, 4x, 6x, 8x, 16x)
- Added advanced parameters for fine-tuning results:
  - Dynamic (1-50)
  - Creativity (0-1)
  - Resemblance (0-3)
  - Handfix (enabled/disabled)
- Added support for multiple output formats (JPEG, PNG, JPG, WEBP)

#### Backend Changes

- Completely rewrote `image_processor.py` to use Replicate API
- Updated `main.py` to handle new parameters
- Added new endpoint `/upscale/options` to get available options
- Removed face restoration field from database schema
- Updated error handling and validation

#### Frontend Changes

- Redesigned the image uploader component with new parameters
- Added UI components for selecting mode, scale factor, and output format
- Added sliders for dynamic, creativity, and resemblance parameters
- Added toggle switch for handfix parameter
- Updated API documentation page
- Added new UI components using Radix UI

#### Documentation

- Updated README.md with new features and parameters
- Created CHANGELOG.md to track changes
- Updated API documentation
- Added setup instructions for Replicate API

### Minor Changes

- Added setup.sh script for easier installation
- Added .env.example file with all required environment variables
- Updated package.json with new dependencies
- Improved error handling and user feedback

## v1.0.0 - 2023-01-01

- Initial release