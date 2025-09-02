# 使用官方 Node.js 18 Alpine 映像檔作為基礎
FROM node:18-alpine AS build

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安裝 pnpm
RUN npm install -g pnpm@latest

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製所有源碼
COPY . .

# 構建應用
RUN pnpm run build

# 使用 nginx 作為生產環境服務器
FROM nginx:alpine AS production

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 複製構建好的文件到 nginx 目錄
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口 8080（Cloud Run 默認）
EXPOSE 8080

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]