# Vercel Deployment Guide for Hotel Management System

## Prerequisites

1. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Backend Services**: Your backend microservices need to be deployed separately

## Frontend Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Navigate to the frontend directory**:

   ```bash
   cd enterprise-dashboard
   ```

2. **Install dependencies** (if not already installed):

   ```bash
   npm install
   ```

3. **Login to Vercel**:

   ```bash
   vercel login
   ```

4. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   - Follow the prompts:
     - Set up and deploy? **Y**
     - Which scope? Select your account
     - Link to existing project? **N**
     - Project name? `hotel-management-dashboard` (or your choice)
     - In which directory is your code located? `./`
     - Want to override settings? **N**

5. **Production Deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import in Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: **Angular**
     - Root Directory: `enterprise-dashboard`
     - Build Command: `npm run build` or `ng build`
     - Output Directory: `dist/enterprise-dashboard`
   - Click "Deploy"

## Backend Deployment

Your backend microservices need to be hosted separately. Options include:

### Option 1: Railway.app

```bash
# For each service
cd hotel-micro-enterprise/[service-name]
railway init
railway up
```

### Option 2: Render.com

- Create a new Web Service for each microservice
- Connect your GitHub repository
- Set build command: `mvn clean install -DskipTests`
- Set start command: `java -jar target/[service-name]-1.0.0.jar`

### Option 3: AWS/Azure/GCP

- Deploy each microservice as a container or serverless function
- Set up API Gateway
- Configure MongoDB Atlas for database

## Environment Configuration

After deploying backend services, update the API proxy configuration:

1. **Update `proxy.conf.json`** with your backend URLs:

   ```json
   {
     "/api": {
       "target": "https://your-backend-api.com",
       "secure": true,
       "changeOrigin": true
     }
   }
   ```

2. **Or update `vercel.json`** routes:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://your-backend-api.com/api/$1"
       }
     ]
   }
   ```

## Environment Variables in Vercel

Add environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `API_URL`: Your backend API URL
   - `NODE_ENV`: `production`

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend services deployed and running
- [ ] MongoDB database accessible from backend
- [ ] API endpoints responding correctly
- [ ] CORS configured on backend for frontend domain
- [ ] Environment variables configured
- [ ] Test login functionality
- [ ] Test all user flows (register, book, payment)
- [ ] Test admin functionality

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Errors

- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Connection Issues

- Verify backend URLs in proxy configuration
- Check CORS settings on backend
- Ensure backend services are running

### Routing Issues

- Verify `vercel.json` has proper rewrites for Angular routing
- Check that all routes redirect to `index.html`

## Useful Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

## Support

For issues:

- Vercel Documentation: https://vercel.com/docs
- Angular Deployment Guide: https://angular.io/guide/deployment
- Spring Boot Deployment: https://spring.io/guides/gs/spring-boot/
