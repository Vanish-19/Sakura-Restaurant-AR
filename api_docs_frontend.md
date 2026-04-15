# API Documentation Toan Du An (AR Restaurant Backend)

## 1. Thong Tin Chung
- REST Base URL: `http://localhost:3000/api/v1`
- Socket URL: `ws://localhost:3000`
- Content-Type: `application/json`

### 1.1 Cac loai token
- Table token: dung cho khach ngoi ban (dine-in), gui qua `Authorization: Bearer <table_token>`.
- User token: dung cho tai khoan khach hang, gui qua `Authorization: Bearer <user_token>`.
- Admin token: dung cho staff/admin, gui qua `Authorization: Bearer <admin_token>`.

### 1.2 Ma loi thong dung
- 200/201: Thanh cong
- 400: Du lieu dau vao khong hop le
- 401: Chua dang nhap / token sai / token het han
- 403: Khong du quyen
- 404: Khong tim thay
- 500: Loi he thong

---

## 2. Public va Customer APIs

### 2.1 Table Session
Base path: `/tables`

#### POST /tables/scan
- Auth: Public
- Muc dich: Quet QR de mo phien ban
- Body:
```json
{
  "qr_hash": "abc-xyz-123"
}
```
- Tra ve: token phien ban + thong tin ban

### 2.2 Menu
Base path: `/menu`

#### GET /menu/items
- Auth: Public
- Query: `category` (optional)
- Muc dich: Lay danh sach mon, bao gom thong tin AR model neu co

### 2.3 Dine-in Orders
Base path: `/orders`

#### POST /orders
- Auth: Table token (bat buoc)
- Body:
```json
{
  "customer_phone": "0987654321",
  "items": [
    {
      "menu_item_id": "65f0c2e9e9a8c8a1d1eab123",
      "quantity": 2,
      "note": "it cay"
    }
  ]
}
```
- Rule validation:
  - `menu_item_id`: ObjectId 24 ky tu
  - `quantity`: so nguyen >= 1
  - `items`: toi thieu 1 phan tu

#### GET /orders/my
- Auth: Table token (bat buoc)
- Muc dich: Lay cac order hien tai cua ban dang ngoi

#### GET /orders
- Auth: Public
- Muc dich: Lay danh sach order active (theo controller hien tai)

#### PATCH /orders/:id/status
- Auth: Khong thay middleware auth o route hien tai
- Body:
```json
{
  "status": "pending | cooking | served | paid"
}
```
- Rule validation:
  - `id`: ObjectId hop le

### 2.4 User Authentication
Base path: `/auth`

#### POST /auth/register
- Auth: Public
- Body:
```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0987654321",
  "password": "123456"
}
```
- Rule: can it nhat 1 trong 2 truong `email` hoac `phone`

#### POST /auth/login
- Auth: Public
- Body:
```json
{
  "identity": "a@example.com",
  "password": "123456"
}
```

#### POST /auth/phone-token
- Auth: Public
- Body:
```json
{
  "phone": "0987654321",
  "name": "Optional Name"
}
```

#### POST /auth/refresh
- Auth: Public
- Body:
```json
{
  "refreshToken": "..."
}
```

#### GET /auth/me
- Auth: User token (bat buoc)

#### POST /auth/logout
- Auth: User token (bat buoc)

### 2.5 User Order History
Base path: `/user/orders`

#### GET /user/orders/history
- Auth: User token (bat buoc)

### 2.6 Takeaway
Base path: `/takeaway`

#### POST /takeaway/orders
- Auth: User token (bat buoc)
- Body:
```json
{
  "customer_name": "Nguyen Van A",
  "customer_phone": "0987654321",
  "delivery_address": "Quan 1, TP.HCM",
  "payment_method": "online",
  "items": [
    {
      "menu_item_id": "65f0c2e9e9a8c8a1d1eab123",
      "quantity": 1,
      "note": "khong hanh"
    }
  ]
}
```

#### GET /takeaway/orders
- Auth: User token (bat buoc)
- Query: `phone` (optional theo schema)

#### GET /takeaway/orders/:id
- Auth: Public
- Validation: `id` la ObjectId hop le

#### PATCH /takeaway/orders/:id/cancel
- Auth: User token (bat buoc)
- Validation: `id` la ObjectId hop le

---

## 3. Payment Provider Endpoints (SePay)

### GET /payments/sepay/return
- Full path: `/api/v1/payments/sepay/return`
- Auth: Public
- Muc dich: Redirect sau khi thanh toan SePay tra ket qua

### POST /payments/sepay/webhook
- Full path: `/api/v1/payments/sepay/webhook`
- Auth: Public (co xac thuc theo `authorization` header trong service)
- Muc dich: Nhan callback thanh toan; emit socket `payment_completed` vao room `admin` neu thanh cong

---

## 4. Admin APIs
Tat ca endpoint trong muc nay (tru login/refresh neu route cho phep) su dung base path `/admin`.

### 4.1 Admin Auth
Base path: `/admin/auth`

#### POST /admin/auth/login
- Auth: Public

#### POST /admin/auth/register
- Auth: Admin token + role `super_admin`

#### POST /admin/auth/refresh
- Auth: Public (theo route hien tai)

#### POST /admin/auth/logout
- Auth: Admin token (bat buoc)

### 4.2 Admin Orders
Base path: `/admin/orders`
- Auth mac dinh: Admin token (tat ca route)

#### GET /admin/orders/stats
- Dashboard thong ke don hang

#### GET /admin/orders
- Query:
  - `status`: `pending | cooking | served | ready | picked_up | paid | cancelled`
  - `order_type`: `dine_in | takeaway`
  - `page`: so nguyen >= 1 (default 1)
  - `limit`: 1..100 (default 20)

#### GET /admin/orders/:id
- `id`: ObjectId

#### PATCH /admin/orders/:id
- Body:
```json
{
  "status": "pending | cooking | served | ready | picked_up | paid | cancelled"
}
```

#### PATCH /admin/orders/:id/cancel

#### DELETE /admin/orders/:id

### 4.3 Admin Tables
Base path: `/admin/tables`
- Auth mac dinh: Admin token (tat ca route)

#### GET /admin/tables

#### POST /admin/tables
- Body:
```json
{
  "name": "Ban so 01",
  "qr_hash": "table-001-sakura"
}
```

#### PATCH /admin/tables/:id
- Body:
```json
{
  "name": "Ban VIP 01",
  "status": "empty"
}
```

#### DELETE /admin/tables/:id

#### POST /admin/tables/:id/reset

### 4.4 Admin Payments
Base path: `/admin/payments`
- Auth mac dinh: Admin token (tat ca route)

#### POST /admin/payments
- Body:
```json
{
  "order_id": "65f0c2e9e9a8c8a1d1eab123",
  "method": "online"
}
```

#### GET /admin/payments

#### GET /admin/payments/:orderId

#### POST /admin/payments/:id/refund

#### POST /admin/payments/:id/confirm-cod

### 4.5 Admin Foods
Base path: `/admin/foods`
- Auth: Admin token
- Ghi chu role:
  - GET: admin da dang nhap
  - POST/PATCH/DELETE: role `admin` hoac `super_admin`

#### GET /admin/foods

#### GET /admin/foods/:id

#### POST /admin/foods
- Body:
```json
{
  "name": "Salmon Sushi",
  "description": "...",
  "price": 120000,
  "category": "Sushi",
  "image_url": "https://...",
  "ar_models": {
    "glb_url": "https://.../salmon.glb",
    "usdz_url": "https://.../salmon.usdz"
  },
  "is_best_seller": true,
  "is_available": true
}
```

#### PATCH /admin/foods/:id
- Body: bat ky tap con field tu schema create (toi thieu 1 field)

#### DELETE /admin/foods/:id

### 4.6 Admin Articles
Base path: `/admin/articles`
- Auth: Admin token
- Ghi chu role:
  - GET: admin da dang nhap
  - POST/PATCH/DELETE: role `admin` hoac `super_admin`

#### GET /admin/articles/stats

#### GET /admin/articles

#### GET /admin/articles/:id

#### POST /admin/articles
- Body:
```json
{
  "title": "Title",
  "content": "Noi dung",
  "category": "Blog",
  "author": "Admin",
  "image_url": "https://...",
  "is_published": true
}
```

#### PATCH /admin/articles/:id
- Body: bat ky tap con field tu schema create (toi thieu 1 field)

#### DELETE /admin/articles/:id

### 4.7 Admin Users
Base path: `/admin/users`
- Auth: Admin token
- Ghi chu role:
  - GET: admin da dang nhap
  - POST/PATCH/DELETE: role `admin` hoac `super_admin`

#### GET /admin/users/stats

#### GET /admin/users

#### GET /admin/users/:id

#### POST /admin/users
- Body:
```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "role": "customer",
  "status": "active"
}
```

#### PATCH /admin/users/:id

#### DELETE /admin/users/:id

### 4.8 Admin Accounts
Base path: `/admin/accounts`
- Auth: Admin token (tat ca route)

#### GET /admin/accounts

#### GET /admin/accounts/stats

#### PATCH /admin/accounts/:id/toggle-status
- Role: chi `super_admin`

### 4.9 Admin Dashboard
Base path: `/admin/dashboard`
- Auth: Admin token

#### GET /admin/dashboard/stats

---

## 5. Socket.io Events

### 5.1 Connect
```javascript
import { io } from 'socket.io-client'
const socket = io('http://localhost:3000')
```

### 5.2 Room cho admin
```javascript
socket.emit('join_admin')
```

### 5.3 Events quan trong
- `new_order_received`: co don dine-in moi
- `new_takeaway_order`: co don takeaway moi
- `order_cancelled`: don bi huy
- `payment_completed`: thanh toan xong
- `table_reset`: ban da duoc giai phong
- `order_updated`: update trang thai don cho khach

---

## 6. Tong hop Endpoint Nhanh

### Public/User-facing
- POST `/api/v1/tables/scan`
- GET `/api/v1/menu/items`
- POST `/api/v1/orders`
- GET `/api/v1/orders/my`
- GET `/api/v1/orders`
- PATCH `/api/v1/orders/:id/status`
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/phone-token`
- POST `/api/v1/auth/refresh`
- GET `/api/v1/auth/me`
- POST `/api/v1/auth/logout`
- GET `/api/v1/user/orders/history`
- POST `/api/v1/takeaway/orders`
- GET `/api/v1/takeaway/orders`
- GET `/api/v1/takeaway/orders/:id`
- PATCH `/api/v1/takeaway/orders/:id/cancel`
- GET `/api/v1/payments/sepay/return`
- POST `/api/v1/payments/sepay/webhook`

### Admin
- POST `/api/v1/admin/auth/login`
- POST `/api/v1/admin/auth/register`
- POST `/api/v1/admin/auth/refresh`
- POST `/api/v1/admin/auth/logout`
- GET `/api/v1/admin/orders/stats`
- GET `/api/v1/admin/orders`
- GET `/api/v1/admin/orders/:id`
- PATCH `/api/v1/admin/orders/:id`
- PATCH `/api/v1/admin/orders/:id/cancel`
- DELETE `/api/v1/admin/orders/:id`
- GET `/api/v1/admin/tables`
- POST `/api/v1/admin/tables`
- PATCH `/api/v1/admin/tables/:id`
- DELETE `/api/v1/admin/tables/:id`
- POST `/api/v1/admin/tables/:id/reset`
- POST `/api/v1/admin/payments`
- GET `/api/v1/admin/payments`
- GET `/api/v1/admin/payments/:orderId`
- POST `/api/v1/admin/payments/:id/refund`
- POST `/api/v1/admin/payments/:id/confirm-cod`
- GET `/api/v1/admin/foods`
- GET `/api/v1/admin/foods/:id`
- POST `/api/v1/admin/foods`
- PATCH `/api/v1/admin/foods/:id`
- DELETE `/api/v1/admin/foods/:id`
- GET `/api/v1/admin/articles/stats`
- GET `/api/v1/admin/articles`
- GET `/api/v1/admin/articles/:id`
- POST `/api/v1/admin/articles`
- PATCH `/api/v1/admin/articles/:id`
- DELETE `/api/v1/admin/articles/:id`
- GET `/api/v1/admin/users/stats`
- GET `/api/v1/admin/users`
- GET `/api/v1/admin/users/:id`
- POST `/api/v1/admin/users`
- PATCH `/api/v1/admin/users/:id`
- DELETE `/api/v1/admin/users/:id`
- GET `/api/v1/admin/accounts`
- GET `/api/v1/admin/accounts/stats`
- PATCH `/api/v1/admin/accounts/:id/toggle-status`
- GET `/api/v1/admin/dashboard/stats`
