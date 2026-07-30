#!/bin/bash

echo "🚀 Оғози навсозии Pobeda Kargo..."

# 1. Навсозии кодҳо аз GitHub (агар лозим бошад branch-ро иваз кунед)
git pull origin main

# 2. Насби вобастагиҳои Бот
echo "📦 Насби модулҳои бот..."
npm install
npx prisma generate
npx prisma db push --accept-data-loss

# 3. Насби вобастагиҳо ва сохтани Панели Админ
echo "📦 Насб ва сохтани Панели Админ..."
cd admin-panel
npm install
npx prisma generate
npm run build
cd ..

# 4. Насби вобастагиҳо ва сохтани Сканер
echo "📦 Насб ва сохтани Сканер..."
cd scanner-app
npm install
npm run build
cd ..

# 5. Бозоғозӣ (Restart) тавассути PM2
echo "🔄 Бозоғозии барномаҳо..."
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "✅ Лоиҳа бо муваффақият навсозӣ ва ба кор андохта шуд!"
