# Railway Deployment Guide - Off The Record

## Quick Start

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) and sign in with GitHub
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose `yuvraaj77715-web/off-the-record`
4. **Configure Environment Variables** (see below)
5. **Deploy**: Railway will automatically detect the Dockerfile and deploy

---

## Environment Variables

Add these in the Railway dashboard under **Variables**:

```env
NODE_ENV=production
JWT_SECRET=f8e7d6c5b4a3928170695847362514039281706958473625140392817069584736251403
DB_HOST=sql110.infinityfree.com
DB_USER=if0_40468821
DB_PASSWORD=Darkhawk25
DB_NAME=if0_40468821_spots
```

> **Note**: Railway automatically provides the `PORT` variable - don't set it manually!

---

## Deployment Configuration

Railway will automatically:
- ✅ Detect the `Dockerfile`
- ✅ Build the Docker image
- ✅ Install all dependencies (Node.js, Python, ffmpeg, build tools)
- ✅ Rebuild bcrypt for Linux
- ✅ Deploy the application
- ✅ Provide a public URL

---

## Files Modified for Railway

### 1. `Dockerfile`
- Updated to use Railway's dynamic `PORT` environment variable
- Keeps default port 4000 for local testing

### 2. `railway.json` (New)
- Explicitly tells Railway to use Dockerfile
- Configures restart policy

---

## Post-Deployment

Once deployed, Railway will provide a URL like:
```
https://off-the-record-production.up.railway.app
```

Test the application:
1. Visit the URL
2. Create an account
3. Log in
4. Play a song from YouTube
5. Test like/unlike functionality

---

## Advantages of Railway

✅ **Automatic HTTPS**: Railway provides SSL certificates automatically  
✅ **Easy Rollbacks**: One-click rollback to previous deployments  
✅ **Built-in Metrics**: Monitor CPU, memory, and network usage  
✅ **GitHub Integration**: Auto-deploy on push  
✅ **Free Tier**: $5 free credit per month (no credit card required)  
✅ **Better Performance**: Generally faster than Render's free tier

---

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure all environment variables are set correctly

### App Crashes on Start
- Verify database credentials are correct
- Check that JWT_SECRET is set
- Review deployment logs

### Can't Connect to Database
- Ensure InfinityFree database allows external connections
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct

---

## Next Steps

1. Commit and push the changes to GitHub
2. Connect your GitHub repository to Railway
3. Set environment variables
4. Deploy!
