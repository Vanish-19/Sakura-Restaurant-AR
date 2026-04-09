---
name: Debug API Endpoint
description: Quy trình debug một API endpoint khi gặp lỗi. Tuân theo thứ tự kiểm tra từ ngoài vào trong (Route → Controller → Service → Model → DB).
---

# Debug API Endpoint

Khi một API endpoint bị lỗi, tuân theo quy trình debug **từ ngoài vào trong**:

## Quy Trình Debug (theo thứ tự)

### Bước 1: Xác nhận Route đã được đăng ký

Kiểm tra trong `src/server.js`:
- Route file đã được import chưa?
- Prefix URL có đúng không? (VD: `/api/v1/orders`)
- Có bị comment out không?

### Bước 2: Kiểm tra Validation Middleware

Kiểm tra trong `src/validations/`:
- Zod schema có đúng format không?
- Có match với data thực tế client gửi lên? 
- Check `body`, `params`, `query` đúng vị trí

**Cách test nhanh:** Tạm thời bỏ validation middleware khỏi route để xem lỗi có phải do validation không.

### Bước 3: Kiểm tra Controller

Kiểm tra trong `src/controllers/`:
- Controller có import đúng service functions?
- Response format có đúng chuẩn? (`{ message, data }`)
- Có handle đúng HTTP method? (GET, POST, PATCH, DELETE)
- `req.body`, `req.params`, `req.query` có được access đúng?

### Bước 4: Kiểm tra Service Logic

Kiểm tra trong `src/services/`:
- Business logic có đúng?
- Có throw Error với message rõ ràng?
- Mongoose query có đúng syntax?
- Populate fields có tồn tại?

### Bước 5: Kiểm tra Model/Schema

Kiểm tra trong `src/models/`:
- Schema fields có match với data?
- Required fields có đúng?
- Default values có hợp lý?
- Ref names có khớp với model names?

### Bước 6: Kiểm tra Database Connection

Kiểm tra `src/config/db.js` và file `.env`:
- Connection string có đúng?
- Database có chạy không?
- Collection names có tồn tại?

## Lỗi thường gặp & Giải pháp nhanh

| Lỗi | Nguyên nhân thường gặp | Giải pháp |
|---|---|---|
| `Cannot GET /api/v1/xxx` | Route chưa đăng ký | Kiểm tra `server.js` imports |
| `400 Data validation failed` | Zod schema không match request | Check request body vs schema |
| `500 Internal Server Error` | Service/Model lỗi | Check console logs, Mongoose errors |
| `Cannot read property of null` | `findById` trả null | Thêm null check trong service |
| `Cast to ObjectId failed` | ID format sai | Thêm regex validation trong Zod |

## Tools Debug Hữu ích

1. **Console.log tạm:** Thêm vào controller/service để trace data flow
2. **Mongoose debug mode:** `mongoose.set('debug', true)` trong `config/db.js`
3. **Postman/curl:** Test trực tiếp API endpoint
4. **Check MongoDB:** Dùng MongoDB Compass hoặc `mongosh` xem data thực
