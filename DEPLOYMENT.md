# Deployment Guide for Kimi Chat Application

This Next.js application can be deployed on various platforms. Here are the most common options:

## 🚀 Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications:

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at [vercel.com](https://vercel.com)

### Deployment Steps
1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy the project:**
   ```bash
   vercel
   ```

3. **Set environment variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `GROQ_API_KEY` with your Groq API key

4. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

## 🌐 Netlify

### Prerequisites
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Create a Netlify account at [netlify.com](https://netlify.com)

### Deployment Steps
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=.next
   ```

## 🐳 Docker

### Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and run
```bash
docker build -t kimi-chat .
docker run -p 3000:3000 -e GROQ_API_KEY=your_api_key kimi-chat
```

## 📋 Environment Variables

Make sure to set these environment variables in your deployment platform:

- `GROQ_API_KEY`: Your Groq API key from [console.groq.com](https://console.groq.com/keys)

## 🗄️ Database

The application uses SQLite which works well for development and small deployments. For production with high traffic, consider:

- PostgreSQL with services like Supabase or Railway
- MySQL with PlanetScale
- MongoDB with MongoDB Atlas

## 🔧 Build Configuration

The project is configured to ignore ESLint and TypeScript errors during build for faster deployment. You can modify this in `next.config.ts`.

## 📝 Notes

- The application includes API routes that need server-side rendering
- Make sure your deployment platform supports Next.js API routes
- The SQLite database will be recreated on each deployment on serverless platforms