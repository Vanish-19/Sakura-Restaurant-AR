# Tài Liệu Tích Hợp Frontend (AR Restaurant API)

Tài liệu này cung cấp toàn bộ hướng dẫn cho Frontend (Web Admin, Client Tablet, Client Mobile) kết nối với hệ thống Backend.

**Base URL API:** `http://localhost:3000/api/v1`
**Base URL Socket:** `ws://localhost:3000`

---

## Phần 1: Client Ordering (Luồng Khách Ăn Tại Quán - Dine in)

Luồng này yêu cầu khách hàng quét mã QR tại bàn để lấy `Token Session` cho bàn đó.

### 1.1 Quét QR Code để mở Bàn
- **Endpoit**: `POST /tables/scan`
- **Loại**: Public
- **Body Request**:
  ```json
  { "qr_hash": "abc-xyz-123" }
  ```
- **Response**: Frontend cần lưu lại `token` này vào *Local/Session Storage* để gắn vào Header `Authorization: Bearer <token>` cho các request gọi món tiếp theo.
  ```json
  {
    "message": "Table session started",
    "token": "eyJhbGciOiJIUzI1...",
    "table": { "_id": "...", "name": "Bàn số 1", "status": "dining" }
  }
  ```

### 1.2 Lấy Menu (Cho hiển thị AR)
- **Endpoint**: `GET /menu/items` (Có thể thêm query `?category=Món Chính`)
- **Loại**: Public
- **Mô tả**: Trả về danh sách món ăn, bao gồm giá và URL của file 3D để Frontend render AR (Augmented Reality).
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "...",
        "name": "Burger Bò Úc",
        "price": 120000,
        "assets": {
          "image_url": "https://...",
          "ar_models": {
            "glb": "https://.../burger.glb",
            "usdz": "https://.../burger.usdz"
          }
        }
      }
    ]
  }
  ```

### 1.3 Đặt Món Dành Cho Bàn
- **Endpoint**: `POST /orders`
- **Loại**: Cần `Authorization: Bearer <Table_Token>`
- **Body Request**:
  ```json
  {
    "items": [
      {
        "menu_item_id": "id-của-món-đó",
        "quantity": 2,
        "note": "Ít cay, không hành"
      }
    ]
  }
  ```
- **Hành vi ngầm**: Backend sẽ lấy `table_id` từ Token thay vì client truyền tay, hạn chế viêc đặt nhầm/hack bàn người khác. Server sẽ đồng thời nhả event `new_order_received` qua Socket io tới luồng bếp.

---

## Phần 2: Luồng Đặt Mang Về (Takeaway / Delivery)

Dành cho Web/PWA App mà khách dùng order ở nhà. Luồng này hoàn toàn **Public (Không cần Auth)**.

### 2.1 Tạo đơn đặt hàng mới
- **Endpoint**: `POST /takeaway/orders`
- **Body Request**:
  ```json
  {
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0987654321",
    "delivery_address": "Khu phố 1, Quận 1, HCM",
    "items": [
       { "menu_item_id": "id-món-1", "quantity": 1 }
    ]
  }
  ```
- **Hành vi**: Server emit socket `new_takeaway_order` về cho admin.

### 2.2 Tra cứu đơn qua SĐT
- **Endpoint**: `GET /takeaway/orders?phone=0987654321`
- **Mô tả**: Khách hàng nhập SĐT để xem trạng thái đơn (`pending` -> `cooking` -> `ready` -> `picked_up`).

---

## Phần 3: Ứng dụng Backend Real-time (Socket.io)

Frontend dùng thư viện `socket.io-client` để thiết lập kết nối thời gian thực.
```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

// Ngay sau khi connect thành công (Nếu là màn hình ADMIN STAFF)
// Frontend CẦN GỌI dòng này để đăng ký nhận phòng (room) admin
socket.emit('join_admin'); 
```

### Các sự kiện (Events) quan trọng cần lắng nghe (`socket.on`):

**Dành cho Màn Hình Bếp / Thu Ngân (Admin Room):**
*   `new_order_received` (Data: Object Order) -> Nhảy popup thông báo Bàn Vừa Đặt Món.
*   `new_takeaway_order` (Data: Object Order Takeaway) -> Nhảy thông báo có đơn đặt ship.
*   `order_cancelled` -> Cập nhật UI huỷ bỏ đơn.
*   `payment_completed` (Data: Object Payment) -> Cập nhật trạng thái bàn đã thanh toán.
*   `table_reset` -> Dọn bàn trên UI.

**Dành cho Tablet Khách Hàng Tại Bàn:**
*   `order_updated` (Data: Object Order) -> Khi bếp đổi trạng thái từ `pending` sang `cooking` hoặc `served`, Frontend Tablet bắt event này để báo cho khách hàng biết ("Món ăn của quý khách đang được nấu!").

---

## Phần 4: Admin API (Dashboard / Bếp)

Tất cả các route này bắt buộc phải truyền Header `Authorization: Bearer <Admin_Token>`.

### 4.1 Đăng nhập lấy Token
- **POST `/admin/auth/login`**: (body: `{ "username": "...", "password": "..." }`). Dùng token trả ra để gắn vào mọi request Admin.

### 4.2 Thống Kê & Bảng Điều Khiển
- **GET `/admin/orders/stats`**: Trả về dữ liệu Số đơn / Doanh thu / Pipeline trạng thái giao hàng dùng vẽ biểu đồ ChartJS ngày hôm nay.

### 4.3 Quản Lý Đơn (Bếp/Staff)
- **GET `/admin/orders`**: Danh sách đơn tại quán. Hỗ trợ query `?status=pending` (để bếp chắt lọc đơn chưa nấu).
- **PATCH `/admin/orders/:id`**: Đổi trạng thái đơn. Body `{ "status": "cooking" }`. (Tuân thủ ràng buộc luồng: `pending` -> `cooking` -> `served` -> `paid`).

### 4.4 Thu Ngân Thực Hiện Thanh Toán (Cashier)
- **POST `/admin/payments`**:
  ```json
  {
    "order_id": "...",
    "method": "cod" // Mặc định là 'online' (chuyển khoản) hoặc 'cod' (tiền mặt/nhận hàng).
  }
  ```
- *Lưu ý*: Với method = `online`, backend tự động sửa trạng thái Order thành `paid` và lưu lịch sử doanh thu lập tức. Với method = `cod`, tạo hóa đơn chờ ở trạng thái thanh toán là `pending`.
- **POST `/admin/payments/:id/confirm-cod`**: Thu ngân bấm nút Đã Nhận Tiền cho đơn ship, kích hoạt hoàn tất thanh toán.

### 4.5 Quản Lý Bàn
- **POST `/admin/tables/:id/reset`**: Nút "Giải phóng bàn" dùng khi khách ăn xong đi về. Đổi trạng thái bàn thành `empty` sẵn sàng cho ca sau.

---

> [!TIP]
> **Quy định Lỗi Chung**
> Frontend check Status code của RESTful:
> - `200/201`: Thành công
> - `400`: Zod block dữ liệu đầu vào không hợp lệ (Sai định dạng).
> - `401`: Token sai hoặc hết hạn (Frontend nên kick User văng ra login).
> - `403`: Không có quyền.
> - `404`: Entity không tồn tại.
> - `500`: Lỗi server nội bộ.
