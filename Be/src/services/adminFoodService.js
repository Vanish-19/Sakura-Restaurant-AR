import MenuItem from '../models/MenuItem.js';
import { createHttpError } from '../utils/AppError.js';
import { uploadRawBufferToCloudinary } from './cloudinaryService.js';

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

  if (resolvedModelType === 'glb') {
    if (!enableAutoUsdzConversion) {
      result.conversionWarning = 'Auto GLB to USDZ conversion is disabled. Upload a native USDZ for iOS Quick Look.';
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
      console.warn('[GLB->USDZ] Conversion failed:', conversionError?.message || conversionError);
      result.conversionError = conversionError?.message || 'Cannot convert GLB to USDZ';
    }
  }

  return result;
};
