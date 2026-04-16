import MenuItem from '../models/MenuItem.js';
import { uploadRawBufferToCloudinary } from './cloudinaryService.js';

function createBadRequestError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function resolveModelType({ modelType, filename }) {
  const normalizedType = String(modelType || '').trim().toLowerCase();
  if (normalizedType === 'glb' || normalizedType === 'usdz') return normalizedType;

  const extension = String(filename || '').split('.').pop()?.toLowerCase();
  if (extension === 'glb' || extension === 'usdz') return extension;

  throw createBadRequestError('Không xác định được loại model. Vui lòng chọn file .glb hoặc .usdz');
}

export const createFood = async (data) => {
  const food = new MenuItem(data);
  return await food.save();
};

export const getAllFoods = async (filter = {}) => {
  return await MenuItem.find(filter).sort({ category: 1, name: 1 });
};

export const getFoodById = async (id) => {
  const food = await MenuItem.findById(id);
  if (!food) throw new Error('Không tìm thấy món ăn');
  return food;
};

export const updateFood = async (id, data) => {
  const updated = await MenuItem.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Không tìm thấy món ăn');
  return updated;
};

export const deleteFood = async (id) => {
  const deleted = await MenuItem.findByIdAndDelete(id);
  if (!deleted) throw new Error('Không tìm thấy món ăn');
  return deleted;
};

export const uploadFoodModel = async ({ file, modelType }) => {
  if (!file?.buffer) {
    throw createBadRequestError('Thiếu file model để upload');
  }

  const resolvedModelType = resolveModelType({ modelType, filename: file.originalname });

  // Upload file gốc lên Cloudinary
  const uploadResult = await uploadRawBufferToCloudinary({
    buffer: file.buffer,
    originalFilename: file.originalname,
    folder: `ar-models/${resolvedModelType}`,
  });

  const result = {
    modelType: resolvedModelType,
    url: uploadResult?.delivery_url || uploadResult?.signed_url || uploadResult?.secure_url,
    signedUrl: uploadResult?.signed_url,
    publicId: uploadResult?.public_id,
    bytes: uploadResult?.bytes,
    format: uploadResult?.format,
  };

  const enableAutoUsdzConversion = process.env.ENABLE_AUTO_USDZ_CONVERSION === 'true';

  // Nếu upload GLB → chỉ convert khi bật cờ môi trường
  if (resolvedModelType === 'glb') {
    if (!enableAutoUsdzConversion) {
      result.conversionWarning =
        'Đã tắt auto-convert GLB->USDZ để tránh mất texture/màu. Vui lòng upload USDZ gốc để dùng iOS Quick Look chuẩn màu.';
      return result;
    }

    try {
      const { convertGlbToUsdz } = await import('./glbToUsdzConverter.js');
      const usdzBuffer = await convertGlbToUsdz(file.buffer);

      const usdzFilename = file.originalname.replace(/\.glb$/i, '.usdz');
      const usdzUploadResult = await uploadRawBufferToCloudinary({
        buffer: usdzBuffer,
        originalFilename: usdzFilename,
        folder: 'ar-models/usdz',
      });

      result.convertedUsdz = {
        url: usdzUploadResult?.delivery_url || usdzUploadResult?.signed_url || usdzUploadResult?.secure_url,
        signedUrl: usdzUploadResult?.signed_url,
        publicId: usdzUploadResult?.public_id,
        bytes: usdzUploadResult?.bytes,
      };
    } catch (conversionError) {
      // Log lỗi nhưng không fail toàn bộ upload
      console.warn('[GLB→USDZ] Conversion failed:', conversionError?.message || conversionError);
      result.conversionError = conversionError?.message || 'Không thể convert GLB sang USDZ';
    }
  }

  return result;
};
