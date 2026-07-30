# Танзимоти Nginx барои сервери Ubuntu

Азбаски дар сервери шумо аллакай лоиҳаи дигар бо домени `gusar.tj` кор карда истодааст, беҳтарин роҳ ин сохтани **субдоменҳо** (subdomains) барои ин лоиҳа мебошад. Масалан:
- `admin.gusar.tj` барои Панели Админ
- `scanner.gusar.tj` барои Сканер

*Шарҳ: Шумо бояд ин субдоменҳоро дар панели идоракунии домени худ (DNS) созед ва ба IP-адреси ҳамин сервери Ubuntu равона кунед (A-Record).*

## 1. Панели Админ (Next.js - Порти 3035)

Файли нав дар Nginx созед:
```bash
sudo nano /etc/nginx/sites-available/pobeda-admin
```

Рамзи зеринро ба он нусхабардорӣ кунед (калимаҳои `admin.gusar.tj`-ро ба субдомени худ иваз кунед):

```nginx
server {
    listen 80;
    server_name admin.gusar.tj;

    location / {
        proxy_pass http://localhost:3035;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 2. Сканер (Vite - Файлҳои Статикӣ)

Файли дигар дар Nginx созед:
```bash
sudo nano /etc/nginx/sites-available/pobeda-scanner
```

Рамзи зеринро нусхабардорӣ кунед (калимаҳои `/path/to/pobeda kargo/scanner-app/dist`-ро ба роҳи дурусти ҷузвдони лоиҳаатон дар сервер иваз кунед):

```nginx
server {
    listen 80;
    server_name scanner.gusar.tj;

    location / {
        root "/var/www/pobeda kargo/scanner-app/dist"; # РОҲРО ДУРУСТ КУНЕД
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## 3. Фаъолсозӣ ва Бозоғозӣ

Пас аз сохтани ин ду файл, онҳоро фаъол кунед ва Nginx-ро бозоғозӣ намоед:

```bash
sudo ln -s /etc/nginx/sites-available/pobeda-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/pobeda-scanner /etc/nginx/sites-enabled/

# Санҷиши хатогиҳои Nginx
sudo nginx -t

# Бозоғозӣ
sudo systemctl restart nginx
```

## 4. Насби SSL (Сартификати бехатарӣ - https://)

Барои он ки сайтҳо бо `https://` кор кунанд (барои сканер кардани камера ин ҳатмӣ аст!), Certbot-ро иҷро кунед:

```bash
sudo certbot --nginx -d admin.gusar.tj -d scanner.gusar.tj
```
