# Run Guide - Sakura Restaurant AR (Phone QR Ready)

Muc tieu: Chay FE/BE de dien thoai quet QR va vao dung ban (`/order?table=XX`).

## 1. Chay backend

```powershell
Set-Location "d:\html css\ArMenuWeb\Sakura-Restaurant-AR\be"
npm run dev
```

## 2. Chay frontend co expose LAN

```powershell
Set-Location "d:\html css\ArMenuWeb\Sakura-Restaurant-AR\fe"
npx vite --host 0.0.0.0 --port 5173
```

Khi chay xong, Vite se in ra:
- Local: `http://localhost:5173`
- Network: `http://<LAN_IP>:5173`

Hay dung URL `Network` cho QR va dien thoai.

## 3. Cai dat base URL cho QR (quan trong)

Tao file `fe/.env.local`:

```env
VITE_CLIENT_BASE_URL=http://<LAN_IP>:5173
```

Vi du:

```env
VITE_CLIENT_BASE_URL=http://10.76.189.63:5173
```

Sau do restart frontend.

## 4. QR cho 50 ban

File da tao san:
- `fe/public/qr/table-links-50.txt`

No chua 50 duong dan:
- `http://<LAN_IP>:5173/order?table=01`
- ...
- `http://<LAN_IP>:5173/order?table=50`

Neu LAN IP thay doi, update nhanh bang PowerShell:

```powershell
$base = "http://<LAN_IP>:5173"
$out = "d:\html css\ArMenuWeb\Sakura-Restaurant-AR\Fe\public\qr\table-links-50.txt"
"# QR links for 50 tables`n# IMPORTANT: Use LAN/public domain (NOT localhost)" | Set-Content -Path $out
1..50 | ForEach-Object {
  "$base/order?table=$($_.ToString('00'))" | Add-Content -Path $out
}
```

## 5. Cac buoc test tren dien thoai

1. Dien thoai va may tinh cung 1 Wi-Fi.
2. Quet 1 QR (vi du ban 03):
   - `http://<LAN_IP>:5173/order?table=03`
3. Kiem tra tren giao dien:
   - Vao dung page order/home.
   - Hien mode dine-in cua dung ban.
4. Thu quet tiep ban khac de xac nhan mapping.

## 6. Loi thuong gap

- Quet khong mo duoc:
  - Kiem tra firewall Windows cho Node/Vite.
  - Kiem tra URL QR co dang `localhost` khong (neu co thi sai).

- Quet mo sai ban:
  - Kiem tra tham so `table=XX` trong QR.
  - Kiem tra co 2 chu so (`01..50`).

- May khac mang:
  - Dung domain public/ngrok/cloudflared thay cho LAN IP.

## 7. Cac file lien quan

- QR route constants: `fe/src/constants/tableQrRoutes.js`
- Trang quan ly ban + QR modal: `fe/src/pages/admin/TableManagementAdminPage.jsx`
- Link 50 ban: `fe/public/qr/table-links-50.txt`
