#!/bin/bash

# 设置环境变量
export NODE_ENV=production
export VITE_API_URL=http://your-api-domain.com/api

# 安装依赖
echo "Installing dependencies..."
npm install

# 构建前端代码
echo "Building frontend..."
npm run build

# 确保目标目录存在
ssh user@your_server_ip "mkdir -p /var/www/useradmin/web"

# 部署到服务器
echo "Deploying to server..."
ssh user@your_server_ip "sudo rm -rf /var/www/useradmin/web/*"
scp -r dist/* user@your_server_ip:/var/www/useradmin/web/

# 配置 Nginx
echo "Configuring Nginx..."
cat > useradmin.conf << EOF
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/useradmin/web;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias /var/www/useradmin/uploads;
        try_files \$uri \$uri/ =404;
    }
}
EOF

# 复制 Nginx 配置
scp useradmin.conf user@your_server_ip:/etc/nginx/conf.d/

# 重启 Nginx
ssh user@your_server_ip "sudo systemctl restart nginx"

echo "Deployment completed!" 