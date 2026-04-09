---
description: Khởi chạy development server cho project AR
---

// turbo-all

1. Kiểm tra file `.env` tồn tại trong `d:\AR` và có chứa `MONGO_URI`

2. Cài đặt dependencies nếu chưa có:
```powershell
cd d:\AR && npm install
```

3. Khởi chạy development server:
```powershell
cd d:\AR && node src/server.js
```

4. Xác nhận server đã chạy bằng cách kiểm tra output có dòng `Server is running on port`

5. Thông báo cho user biết server đang chạy ở port nào và các API endpoints có sẵn:
   - `GET /api/v1/orders`
   - `POST /api/v1/orders`
   - `PATCH /api/v1/orders/:id/status`
   - `GET /api/v1/menu/items`
   - `GET /api/v1/tables`
