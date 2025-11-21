# ----------------------------
# 1. Base Image
# ----------------------------
FROM node:20-slim

# Install yt-dlp + ffmpeg + build tools (for native modules like bcrypt)
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg build-essential && \
    pip install --break-system-packages yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ----------------------------
# 2. App Directory
# ----------------------------
WORKDIR /app

# ----------------------------
# 3. Install Dependencies
# ----------------------------
# Copy ONLY backend package files first (better cache)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
RUN cd backend && npm rebuild bcrypt --build-from-source

# ----------------------------
# 4. Copy Source Files
# ----------------------------
# Only copy backend files (frontend is hosted on InfinityFree)
COPY backend ./backend

# ----------------------------
# 5. Set Environment
# ----------------------------
ENV NODE_ENV=production

# Railway provides PORT dynamically, but we set a default for local testing
ENV PORT=4000

EXPOSE $PORT

# ----------------------------
# 6. Start Command
# ----------------------------
CMD ["node", "backend/server.js"]
