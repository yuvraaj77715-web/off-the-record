# Split Deployment Guide
## Frontend on InfinityFree + Backend on Railway

This guide explains how to deploy the frontend on InfinityFree and the backend on Railway.

---

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐
│  InfinityFree       │         │  Railway             │
│  (Frontend)         │  HTTPS  │  (Backend API)       │
│                     │────────▶│                      │
│  - index.html       │         │  - Express Server    │
│  - style.css        │         │  - MySQL Connection  │
│  - script.js        │         │  - YouTube Streaming │
│  - assets/          │         │  - Authentication    │
└─────────────────────┘         └──────────────────────┘
   off-the-record.42web.io      off-the-record-production
                                      .up.railway.app
```

---

## Part 1: Deploy Backend to Railway

### Step 1: Push Code to GitHub

```bash
git add -A
git commit -m "Configure split deployment - frontend on InfinityFree, backend on Railway"
git push
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Create **New Project** → **Deploy from GitHub repo**
3. Select `yuvraaj77715-web/off-the-record`
4. Railway will detect the Dockerfile and deploy

### Step 3: Set Environment Variables in Railway

Go to **Variables** and add:

```env
NODE_ENV=production
JWT_SECRET=f8e7d6c5b4a3928170695847362514039281706958473625140392817069584736251403
DB_HOST=sql110.infinityfree.com
DB_USER=if0_40468821
DB_PASSWORD=Darkhawk25
DB_NAME=if0_40468821_spots
```

### Step 4: Get Backend URL

Once deployed, Railway provides a URL like:
```
https://off-the-record-production.up.railway.app
```

Test the API:
```
https://off-the-record-production.up.railway.app/
```

Should return:
```json
{
  "status": "OK",
  "message": "Off The Record API is running",
  "timestamp": "2025-11-21T..."
}
```

---

## Part 2: Deploy Frontend to InfinityFree

### Step 1: Prepare Frontend Files

The frontend files you need to upload:
```
frontend/
├── index.html
├── style.css
├── script.js (already updated with Railway API URL)
└── assets/ (if any)
```

### Step 2: Access InfinityFree File Manager

1. Go to [InfinityFree Control Panel](https://app.infinityfree.com/)
2. Select your account: `off-the-record.42web.io`
3. Click **"File Manager"** or **"Online File Manager"**

### Step 3: Upload Frontend Files

1. Navigate to `htdocs/` folder (this is your web root)
2. Upload all files from the `frontend/` folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - Any other assets

**Alternative: Use FTP**
- Host: `ftpupload.net`
- Username: Your InfinityFree username
- Password: Your InfinityFree password
- Upload to `/htdocs/` directory

### Step 4: Verify Frontend

Visit: `https://off-the-record.42web.io`

You should see your login/signup page.

---

## Part 3: Verify Integration

### Test the Complete Flow

1. **Visit Frontend**: `https://off-the-record.42web.io`
2. **Sign Up**: Create a new account
   - Frontend sends request to Railway backend
   - Backend stores user in MySQL database
3. **Login**: Log in with your credentials
   - Backend validates and returns JWT token
4. **Play Song**: Enter a YouTube URL
   - Backend uses yt-dlp to stream audio
5. **Like Song**: Test like/unlike functionality
   - Backend stores likes in database

### Check Browser Console

Open DevTools (F12) → Console

You should see API calls to:
```
https://off-the-record-production.up.railway.app/signup
https://off-the-record-production.up.railway.app/login
https://off-the-record-production.up.railway.app/songs
```

---

## Configuration Details

### Frontend Changes

**File**: `frontend/script.js`
```javascript
const API_URL = "https://off-the-record-production.up.railway.app";
```

All API calls now go to Railway backend.

### Backend Changes

**File**: `backend/server.js`

**CORS Configuration**:
```javascript
const corsOptions = {
  origin: [
    'https://off-the-record.42web.io',  // InfinityFree frontend
    'http://off-the-record.42web.io',   // HTTP fallback
    'http://localhost:3000',             // Local development
    'http://localhost:5500',             // Live Server
  ],
  credentials: true
};
```

**Removed**:
- Frontend static file serving
- Root route now returns API health check

---

## Troubleshooting

### CORS Errors

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Verify backend CORS includes your InfinityFree domain
2. Check Railway logs for CORS errors
3. Ensure `credentials: true` in CORS options

### API Not Responding

**Check**:
1. Railway deployment is "Live"
2. Backend URL is correct in `script.js`
3. Environment variables are set in Railway
4. Database credentials are correct

### Frontend Not Loading

**Check**:
1. Files uploaded to `/htdocs/` in InfinityFree
2. `index.html` is in the root of `/htdocs/`
3. File permissions are correct (644 for files, 755 for folders)

---

## Advantages of Split Deployment

✅ **Free Frontend Hosting**: InfinityFree provides free static hosting  
✅ **Robust Backend**: Railway handles complex backend operations  
✅ **Better Performance**: Static files served from InfinityFree CDN  
✅ **Easy Updates**: Update frontend without redeploying backend  
✅ **Cost Effective**: Only pay for backend compute on Railway

---

## URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://off-the-record.42web.io` | User interface |
| Backend API | `https://off-the-record-production.up.railway.app` | API endpoints |
| Database | `sql110.infinityfree.com` | MySQL database |

---

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Frontend uploaded to InfinityFree
3. ⏳ Test complete user flow
4. ⏳ Monitor Railway logs for errors
5. ⏳ Share your app with users!

Your split deployment is complete! 🎉
