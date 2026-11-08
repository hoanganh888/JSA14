# Vườn Toán Lớp 3 — chạy bằng Docker (VPS hoặc dịch vụ hỗ trợ Docker)
FROM node:20-bookworm-slim
WORKDIR /app
# Công cụ biên dịch cho better-sqlite3 (thường có bản dựng sẵn, để dự phòng)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY public ./public
COPY data/seed.json ./data/seed.json
COPY data/curriculum.json ./data/curriculum.json
ENV NODE_ENV=production
# DB nằm ở /data — khi chạy hãy gắn volume vào đây để dữ liệu bền vững
# (dùng Railway Volumes / `docker run -v` để mount, không dùng VOLUME ở đây vì
# Railway's builder từ chối Dockerfile có khai báo VOLUME)
ENV DB_PATH=/data/vuon-toan.db
EXPOSE 3000
CMD ["node", "server/index.js"]
