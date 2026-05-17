# Deploy len domain that bang GitHub Actions

Tai lieu nay dung cho cau truc hien tai:

- Frontend: `Fe` - Vite React, build ra `Fe/dist`
- Backend: `Be` - Express, MongoDB, Socket.IO, chay port `3000`
- VPS path mac dinh: `/var/www/sakura`
- Domain mau: `your-domain.com`

Neu chua co domain tra phi, co the dung domain mien phi dang subdomain, vi du:

```text
your-name.duckdns.org
```

Voi app nay, phuong an free domain de dung nhat la DuckDNS + VPS + Nginx.

## 1. Chuan bi VPS

Dung Ubuntu 22.04/24.04. Cai Node.js, Nginx, PM2, Certbot:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx rsync certbot python3-certbot-nginx
sudo npm install -g pm2
```

Tao thu muc deploy va gan quyen cho user deploy:

```bash
sudo mkdir -p /var/www/sakura/fe /var/www/sakura/be
sudo chown -R $USER:$USER /var/www/sakura
```

## 2. Tao file env backend tren VPS

Tren VPS, tao file:

```bash
nano /var/www/sakura/be/.env
```

Noi dung dua theo `Be/.env.example`, thay gia tri that:

```env
PORT=3000
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://your-domain.com
SEPAY_RETURN_URL=https://your-domain.com/api/v1/payments/sepay/return
SEPAY_WEBHOOK_URL=https://your-domain.com/api/v1/payments/sepay/webhook
CLOUDINARY_URL=...
```

Khong commit file `.env` len GitHub.

## 3. Chon domain

### Cach khuyen dung khi muon mien phi: DuckDNS

1. Vao `https://www.duckdns.org`
2. Dang nhap
3. Tao subdomain, vi du:

```text
sakura-ar.duckdns.org
```

4. Gan IP cua VPS vao subdomain do.

Tu luc nay, trong tat ca config, thay:

```text
your-domain.com
```

bang:

```text
sakura-ar.duckdns.org
```

Kiem tra DNS:

```bash
ping sakura-ar.duckdns.org
```

### Neu sau nay mua domain that

Trong trang quan ly domain, tao DNS record:

```text
A     @      VPS_PUBLIC_IP
A     www    VPS_PUBLIC_IP
```

Cho DNS propagate xong, kiem tra:

```bash
ping your-domain.com
```

## 4. Cau hinh Nginx

Tren VPS:

```bash
sudo nano /etc/nginx/sites-available/sakura
```

Lay noi dung tu `deploy/nginx-sakura.conf`, thay `your-domain.com` bang domain that hoac DuckDNS subdomain.

Vi du neu dung DuckDNS:

```nginx
server_name sakura-ar.duckdns.org;
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/sakura
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Bat SSL HTTPS

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Neu dung DuckDNS va khong co `www`:

```bash
sudo certbot --nginx -d sakura-ar.duckdns.org
```

Sau khi thanh cong, website se chay qua:

```text
https://your-domain.com
```

Hoac:

```text
https://sakura-ar.duckdns.org
```

## 6. Tao SSH key deploy

Tren may local hoac VPS, tao key rieng cho GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-sakura" -f sakura_deploy_key
```

Them public key vao VPS:

```bash
cat sakura_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Gia tri private key trong `sakura_deploy_key` se dua vao GitHub Secret `VPS_SSH_KEY`.

## 7. Tao GitHub Secrets

Vao GitHub repository:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Them cac secret:

```text
VPS_HOST      = IP public cua VPS
VPS_USER      = user SSH tren VPS
VPS_PORT      = 22
VPS_SSH_KEY   = noi dung private key sakura_deploy_key
```

## 8. Deploy

Workflow da co tai:

```text
.github/workflows/deploy.yml
```

Moi lan push len branch `main`, GitHub Actions se:

1. Build frontend trong `Fe`
2. Upload `Fe/dist` len `/var/www/sakura/fe`
3. Upload backend `Be` len `/var/www/sakura/be`
4. Chay `npm ci --omit=dev`
5. Restart backend bang PM2

Co the deploy thu cong tu GitHub:

```text
Actions -> Deploy production -> Run workflow
```

## 9. Kiem tra sau deploy

Tren VPS:

```bash
pm2 status
pm2 logs sakura-api
curl http://127.0.0.1:3000/api/v1/menu
```

Tren browser:

```text
https://your-domain.com
https://your-domain.com/order?table=01
```

## 10. Luu y quan trong

- Neu `Be/.env` tung bi push len GitHub, can doi/rotate MongoDB password, JWT secret, SePay key va Cloudinary secret.
- File `.env` production nam tren VPS, workflow khong upload de tranh ghi de secret.
- QR production nen dung `https://your-domain.com/order?table=XX`, khong dung localhost/LAN IP.
