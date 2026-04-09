---
description: Tạo nhanh một bộ CRUD API endpoint mới theo chuẩn project
---

1. Hỏi user tên resource cần tạo (VD: Category, Reservation, Payment...) và các fields cần có.

2. Đọc skill `scaffold-api` bằng cách view file `d:\AR\.agents\skills\scaffold-api\SKILL.md` để hiểu pattern chuẩn của project.

3. Tạo Model trong `src/models/<ResourceName>.js` theo pattern trong skill.

4. Tạo Validation schemas trong `src/validations/<resource>Validation.js` theo pattern trong skill.

5. Tạo Service trong `src/services/<resource>Service.js` theo pattern trong skill.

6. Tạo Controller trong `src/controllers/<resource>Controller.js` theo pattern trong skill.

7. Tạo Route trong `src/routes/<resource>Routes.js` theo pattern trong skill.

8. Đăng ký route mới vào `src/server.js` với prefix `/api/v1/<resource-name>`.

9. Hiển thị tóm tắt các files đã tạo và các API endpoints có sẵn cho user.
