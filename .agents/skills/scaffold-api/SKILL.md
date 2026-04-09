---
name: Scaffold API Endpoint
description: Tạo một CRUD API endpoint mới theo chuẩn kiến trúc project AR (Model → Validation → Service → Controller → Route). Sử dụng skill này mỗi khi cần tạo mới một resource API.
---

# Scaffold API Endpoint

Khi tạo một API endpoint mới cho project, **BẮT BUỘC** tuân theo kiến trúc layered này:

```
Request → Route → [Validation Middleware] → Controller → Service → Model → MongoDB
```

## Bước 1: Tạo Model (`src/models/<ResourceName>.js`)

- Sử dụng **Mongoose Schema**
- Luôn bật `{ timestamps: true }` để tự tạo `createdAt`, `updatedAt`  
- Export default `mongoose.model()`
- Đặt tên file theo **PascalCase** (VD: `MenuItem.js`, `Table.js`)

```javascript
// Ví dụ mẫu:
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ... các fields khác
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
```

## Bước 2: Tạo Validation (`src/validations/<resource>Validation.js`)

- Sử dụng **Zod** (KHÔNG dùng Joi hay express-validator)
- Schema Zod bao bọc cả `body`, `params`, `query` trong một object
- Export **named exports** cho từng schema (createSchema, updateSchema, getSchema...)
- Đặt tên file theo **camelCase** (VD: `orderValidation.js`)

```javascript
// Ví dụ mẫu:
import { z } from 'zod';

export const createResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    // ... các fields khác
  })
});

export const updateResourceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
  }),
  body: z.object({
    // ... fields cần update
  })
});
```

## Bước 3: Tạo Service (`src/services/<resource>Service.js`)

- Chứa **toàn bộ business logic** (controller KHÔNG được chứa logic)
- Import Model trực tiếp
- Export **named functions** (KHÔNG dùng class)
- Throw Error khi có lỗi logic (controller sẽ catch)
- Đặt tên file theo **camelCase** (VD: `orderService.js`)

```javascript
// Ví dụ mẫu:
import Resource from '../models/Resource.js';

export const createResource = async (data) => {
  const resource = new Resource(data);
  return await resource.save();
};

export const getAllResources = async (filter = {}) => {
  return await Resource.find(filter).sort({ createdAt: -1 });
};

export const getResourceById = async (id) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new Error('Resource not found');
  return resource;
};

export const updateResource = async (id, data) => {
  const updated = await Resource.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Resource not found');
  return updated;
};

export const deleteResource = async (id) => {
  const deleted = await Resource.findByIdAndDelete(id);
  if (!deleted) throw new Error('Resource not found');
  return deleted;
};
```

## Bước 4: Tạo Controller (`src/controllers/<resource>Controller.js`)

- Chỉ làm nhiệm vụ **nhận request, gọi service, trả response**
- KHÔNG chứa business logic
- Sử dụng `express-async-handler` để wrap async functions
- Response format thống nhất: `{ message: '...', data: ... }`
- HTTP Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
- Nếu cần emit Socket.io event: truy cập qua `req.io`

```javascript
// Ví dụ mẫu:
import asyncHandler from 'express-async-handler';
import * as resourceService from '../services/resourceService.js';

export const getAll = asyncHandler(async (req, res) => {
  const items = await resourceService.getAllResources(req.query);
  res.status(200).json({ message: 'Fetched successfully', data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await resourceService.getResourceById(req.params.id);
  res.status(200).json({ message: 'Fetched successfully', data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await resourceService.createResource(req.body);
  // Emit socket event nếu cần realtime
  req.io.to('admin').emit('resource:new', item);
  res.status(201).json({ message: 'Created successfully', data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await resourceService.updateResource(req.params.id, req.body);
  res.status(200).json({ message: 'Updated successfully', data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(req.params.id);
  res.status(200).json({ message: 'Deleted successfully' });
});
```

## Bước 5: Tạo Route (`src/routes/<resource>Routes.js`)

- Import controller functions và validation schemas
- Sử dụng middleware `validateParams` từ `../middlewares/validateRequest.js`
- Export default `router`
- Đặt tên file theo **camelCase** + suffix `Routes` (VD: `orderRoutes.js`)

```javascript
// Ví dụ mẫu:
import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createResourceSchema, updateResourceSchema } from '../validations/resourceValidation.js';
import * as resourceController from '../controllers/resourceController.js';

const router = express.Router();

router.get('/', resourceController.getAll);
router.get('/:id', resourceController.getById);
router.post('/', validateParams(createResourceSchema), resourceController.create);
router.patch('/:id', validateParams(updateResourceSchema), resourceController.update);
router.delete('/:id', resourceController.remove);

export default router;
```

## Bước 6: Đăng ký Route vào Server (`src/server.js`)

- Import route file
- Đăng ký với prefix `/api/v1/<resource-name>`

```javascript
import resourceRoutes from './routes/resourceRoutes.js';
app.use('/api/v1/resources', resourceRoutes);
```

## Checklist Trước Khi Hoàn Thành

- [ ] Model có `timestamps: true`
- [ ] Validation dùng Zod, bọc body/params/query
- [ ] Service chứa toàn bộ business logic
- [ ] Controller chỉ gọi service và trả response
- [ ] Route đã gắn validation middleware
- [ ] Route đã đăng ký trong `server.js`
- [ ] Tên file đúng convention (Model: PascalCase, còn lại: camelCase)
