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
RUN cd backend && npm install --omit=dev && npm rebuild bcrypt --build-from-source

# ----------------------------
# 4. Copy Source Files
# ----------------------------
COPY backend ./backend
COPY frontend ./frontend

# ----------------------------
# 5. Set Environment
# ----------------------------
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

# ----------------------------
# 6. Start Command
# ----------------------------
CMD ["node", "backend/server.js"]
