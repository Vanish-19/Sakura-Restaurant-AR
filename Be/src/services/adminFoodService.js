import MenuItem from '../models/MenuItem.js';
import { createHttpError } from '../utils/AppError.js';
import { uploadRawBufferToCloudinary } from './cloudinaryService.js';

const MODEL_UPLOAD_MAX_SIZE_MB = 10;

function resolveModelType({ modelType, filename }) {
  const normalizedType = String(modelType || '').trim().toLowerCase();
  if (normalizedType === 'glb' || normalizedType === 'usdz') return normalizedType;

  const extension = String(filename || '').split('.').pop()?.toLowerCase();
  if (extension === 'glb' || extension === 'usdz') return extension;

  throw createHttpError('Cannot determine model type. Upload a .glb or .usdz file.', 400, 'MODEL_TYPE_INVALID');
}

export const createFood = async (data) => {
  const food = new MenuItem(data);
  return food.save();
};

export const getAllFoods = async (filter = {}) => {
  const allowedFilter = {};
  if (filter.category) allowedFilter.category = filter.category;
  if (filter.is_available !== undefined) allowedFilter.is_available = filter.is_available === 'true' || filter.is_available === true;
  return MenuItem.find(allowedFilter).sort({ category: 1, name: 1 }).lean();
};

export const getFoodById = async (id) => {
  const food = await MenuItem.findById(id);
  if (!food) throw createHttpError('Food item not found', 404, 'FOOD_NOT_FOUND');
  return food;
};

export const updateFood = async (id, data) => {
  const updated = await MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) throw createHttpError('Food item not found', 404, 'FOOD_NOT_FOUND');
  return updated;
};

export const deleteFood = async (id) => {
  const deleted = await MenuItem.findByIdAndDelete(id);
  if (!deleted) throw createHttpError('Food item not found', 404, 'FOOD_NOT_FOUND');
  return deleted;
};

export const uploadFoodModel = async ({ file, modelType }) => {
  if (!file?.buffer) {
    throw createHttpError('Model file is required', 400, 'MODEL_FILE_REQUIRED');
  }

  const resolvedModelType = resolveModelType({ modelType, filename: file.originalname });

  let uploadResult;
  try {
    uploadResult = await uploadRawBufferToCloudinary({
      buffer: file.buffer,
      originalFilename: file.originalname,
      folder: `ar-models/${resolvedModelType}`,
    });
  } catch (error) {
    if (/file size too large/i.test(error?.message || '')) {
      throw createHttpError(`Kích thước file model vượt giới hạn lưu trữ hiện tại. Vui lòng upload file tối đa ${MODEL_UPLOAD_MAX_SIZE_MB}MB.`, 413, 'MODEL_FILE_TOO_LARGE');
    }

    throw error;
  }

  const result = {
    modelType: resolvedModelType,
    url: uploadResult?.delivery_url || uploadResult?.signed_url || uploadResult?.secure_url,
    signedUrl: uploadResult?.signed_url,
    publicId: uploadResult?.public_id,
    bytes: uploadResult?.bytes,
    format: uploadResult?.format,
  };

  return result;
};
