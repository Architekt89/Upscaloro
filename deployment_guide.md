# Upscalor Deployment Guide

This guide provides instructions for deploying the Upscalor application, including both the FastAPI backend and Next.js frontend.

## Prerequisites

- Git
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL or Supabase account
- Stripe account
- Google Colab account (optional, for GPU-accelerated processing)
- Domain name (optional, but recommended for production)

## 1. Backend Deployment

### Option 1: Deploy to a VPS (e.g., DigitalOcean, AWS EC2, Linode)

1. **Provision a server**
   - Recommended specs: 2 CPU cores, 4GB RAM, 50GB SSD
   - Ubuntu 20.04 or later

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-venv nginx
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/upscalor.git
   cd upscalor/backend
   ```

4. **Set up a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   nano .env
   ```

6. **Set up Gunicorn as a service**
   Create a systemd service file:
   ```bash
   sudo nano /etc/systemd/system/upscalor.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=Upscalor FastAPI Application
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/upscalor/backend
   Environment="PATH=/home/ubuntu/upscalor/backend/venv/bin"
   EnvironmentFile=/home/ubuntu/upscalor/backend/.env
   ExecStart=/home/ubuntu/upscalor/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

   [Install]
   WantedBy=multi-user.target
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/upscalor
   ```

   Add the following content:
   ```
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/upscalor /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Start the service**
   ```bash
   sudo systemctl start upscalor
   sudo systemctl enable upscalor
   ```

9. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create upscalor-api
   ```

4. **Add a Procfile**
   Create a file named `Procfile` in the backend directory:
   ```
   web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

5. **Set environment variables**
   ```bash
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set SUPABASE_URL=your_supabase_url
   # Set all other environment variables
   ```

6. **Deploy the app**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Option 3: Deploy to Google Cloud Run

1. **Install Google Cloud SDK**
   Follow the instructions at: https://cloud.google.com/sdk/docs/install

2. **Initialize Google Cloud**
   ```bash
   gcloud init
   ```

3. **Build and deploy the container**
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/your-project-id/upscalor-api
   gcloud run deploy upscalor-api --image gcr.io/your-project-id/upscalor-api --platform managed
   ```

## 2. Frontend Deployment

### Option 1: Deploy to Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the frontend**
   ```bash
   cd frontend
   vercel
   ```

4. **Set environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy to Netlify**
   ```bash
   netlify deploy
   ```

5. **Set environment variables**
   Go to the Netlify dashboard, navigate to your site, then:
   - Site settings > Build & deploy > Environment
   - Add all the required environment variables

6. **Deploy to production**
   ```bash
   netlify deploy --prod
   ```

## 3. Google Colab Setup (Optional)

If you want to use Google Colab for GPU-accelerated image processing:

1. **Upload the `colab_upscaler.ipynb` to Google Drive**

2. **Open the notebook in Google Colab**
   - Click on the notebook in Google Drive
   - Select "Open with Google Colaboratory"

3. **Run the notebook**
   - The notebook will install all required dependencies
   - It will start a FastAPI server with ngrok
   - Copy the ngrok URL provided

4. **Update the backend environment variable**
   ```
   COLAB_API_URL=https://your-ngrok-url.ngrok.io
   ```

## 4. Database Setup

### Supabase (Recommended)

1. **Create a Supabase project**
   - Go to https://supabase.com and sign up
   - Create a new project

2. **Run the SQL setup script**
   - Go to the SQL Editor in the Supabase dashboard
   - Copy and paste the contents of `backend/supabase_setup.sql`
   - Run the script

3. **Create storage buckets**
   - Go to Storage in the Supabase dashboard
   - Create a new bucket named "images"
   - Set the bucket to private

4. **Get the API keys**
   - Go to Project Settings > API
   - Copy the URL and anon key
   - Add them to your environment variables

### PostgreSQL (Self-hosted)

1. **Install PostgreSQL**
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. **Create a database and user**
   ```bash
   sudo -u postgres psql
   ```

   In the PostgreSQL prompt:
   ```sql
   CREATE DATABASE upscalor;
   CREATE USER upscalor_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE upscalor TO upscalor_user;
   \q
   ```

3. **Run the SQL setup script**
   ```bash
   sudo -u postgres psql -d upscalor -f backend/supabase_setup.sql
   ```

## 5. Stripe Setup

Follow the instructions in the `backend/stripe_setup.md` file to set up Stripe for payments.

## 6. Monitoring and Maintenance

### Set up monitoring

1. **Install Prometheus and Grafana** (for self-hosted deployments)
   ```bash
   sudo apt install -y prometheus grafana
   ```

2. **Configure logging**
   - Set up log rotation for application logs
   - Consider using a service like Datadog, New Relic, or Sentry

### Regular maintenance

1. **Database backups**
   - For Supabase: Backups are handled automatically
   - For self-hosted PostgreSQL:
     ```bash
     pg_dump -U upscalor_user upscalor > backup.sql
     ```

2. **Update dependencies**
   - Regularly check for security updates
   - Update npm packages and Python dependencies

3. **Monitor disk space**
   - Set up alerts for low disk space
   - Implement a cleanup policy for processed images

## Troubleshooting

### Common issues

1. **Backend not starting**
   - Check logs: `sudo journalctl -u upscalor.service`
   - Verify environment variables are set correctly

2. **Frontend build failing**
   - Check for TypeScript errors
   - Ensure all dependencies are installed

3. **Image processing errors**
   - Check if the Replicate API token is set correctly
   - Verify API rate limits haven't been exceeded
   - Check if the Replicate service is operational

4. **Database connection issues**
   - Verify connection string is correct
   - Check if database is accessible from the server

### Getting help

- Open an issue on the GitHub repository
- Check the documentation for more detailed information
- Join the community Discord server for support

## Security Considerations

1. **API Security**
   - Use HTTPS for all communications
   - Implement rate limiting
   - Validate all user inputs

2. **Authentication**
   - Use secure password hashing
   - Implement proper JWT handling
   - Consider adding two-factor authentication

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper access controls
   - Regularly audit access logs

4. **Compliance**
   - Ensure GDPR compliance if serving European users
   - Consider CCPA for California users
   - Implement proper privacy policies 