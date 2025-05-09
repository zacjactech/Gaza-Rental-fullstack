# Gaza-Rental-Website

A rental property listing application for Tanzania, built with Next.js, TypeScript, Tailwind CSS, and MongoDB Atlas.

## Features

- Property listing and search
- User authentication with JWT
- MongoDB database integration
- Property filtering and searching
- Interactive map view with Leaflet
- Responsive design
- Multi-language support (English/Swahili)
- Dark/light mode

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Maps**: Leaflet.js for interactive maps
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 16.x or later
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Gaza-Rental-Website.git
cd Gaza-Rental-Website
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB connection
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/gazarental?retryWrites=true&w=majority

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
```

4. Test your database connection:

```bash
npm run test-db
# or
yarn test-db
```

5. Seed the database with initial data:

```bash
npm run seed-db
# or
yarn seed-db
```

6. Start the development server:

```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

This project is configured for easy deployment on Vercel. Follow these steps to deploy:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one already.

2. Install the Vercel CLI (optional):

```bash
npm install -g vercel
```

3. Prepare your project for deployment:

```bash
# Clean, install dependencies, lint, and build the project
npm run prepare-deploy
```

4. Deploy using one of these methods:

   **Option 1: Deploy from the Vercel Dashboard**

   - Fork or push your code to a GitHub repository
   - Log in to your Vercel account
   - Click "New Project" and import your GitHub repository
   - Configure your project:
     - Set the framework preset to "Next.js"
     - Add all environment variables from your `.env.local` file
     - Click "Deploy"

   **Option 2: Deploy using the Vercel CLI**

   ```bash
   # Deploy using our deployment script
   # For Windows:
   deploy.bat

   # For Unix/Linux/macOS:
   bash deploy.sh

   # Or manually:
   vercel --prod
   ```

5. After deployment, Vercel will provide you with a production URL for your application.

6. Set up environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" section
   - Add all required environment variables from your `.env.local` file

### Project Maintenance Scripts

This project includes several utility scripts to help with maintenance and deployment:

- **clean**: Remove build artifacts and temporary files

  ```bash
  npm run clean
  ```

- **check-env**: Verify that all required environment variables are set

  ```bash
  npm run check-env
  ```

- **prepare-deploy**: Clean, install dependencies, lint, and build the project
  ```bash
  npm run prepare-deploy
  ```

### Automatic Deployments

Once connected to a Git repository, Vercel will automatically deploy:

- Production deployments when you push to the main branch
- Preview deployments when you create pull requests

### Custom Domain

To add a custom domain to your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Domains"
3. Add your domain and follow the verification instructions

## MongoDB Atlas Setup

This project uses MongoDB Atlas as the database. To set up your own MongoDB Atlas database:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Click "Connect" on your cluster and choose "Connect your application"
4. Copy the connection string and replace the placeholders with your username and password
5. Add the connection string to your `.env.local` file

## Database Schema

The application uses the following collections:

- **properties**: Rental property listings
- **users**: User accounts with authentication
- **bookings**: Property booking requests
- **reviews**: User reviews of properties
- **payments**: Payment records
- **sessions**: User sessions

## Demo Credentials

After running the seed script, you can log in with:

- Email: demo@example.com
- Password: password

## License

This project is licensed under the MIT License.

## Recent Updates

### MongoDB Integration and Backend Services

We've now fully implemented MongoDB integration with several models and services:

1. **Models**:

   - User Model - Authentication and user profiles
   - Property Model - Rental property listings
   - Booking Model - Property applications and rental requests
   - Message Model - User-to-user communication
   - Review Model - Property reviews and ratings
   - Favorite Model - User property bookmarks

2. **Services**:

   - Auth Service - User registration, login, token management
   - Property Service - Property CRUD operations, search, and filtering
   - Booking Service - Property application handling
   - Message Service - User messaging and conversation management
   - Review Service - Property reviews management
   - Favorite Service - User favorites management
   - User Service - Profile management and user operations

3. **API Endpoints**:

   - `/api/auth/*` - Authentication endpoints (login, register, logout)
   - `/api/properties/*` - Property listing management endpoints
   - `/api/bookings/*` - Booking/application management endpoints
   - `/api/messages/*` - Messaging endpoints
   - `/api/reviews/*` - Property review endpoints
   - `/api/favorites/*` - User favorites endpoints
   - `/api/users/*` - User profile endpoints

4. **Frontend Integration**:
   - Connected login and registration forms to API
   - Updated property listings to fetch real data
   - Updated property details page to fetch real data
   - Added favorites functionality
   - Integrated dashboard with real data
   - Implemented pagination on browse page
   - Added loading and error states to all data fetching components

### Data Schema

Our MongoDB database includes the following collections:

- **users**: Stores user account information
- **properties**: Property listings
- **bookings**: Property applications and rental agreements
- **messages**: User-to-user messages
- **reviews**: Property reviews
- **favorites**: User bookmarks

### Environment Variables

Make sure to set up the following environment variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```
