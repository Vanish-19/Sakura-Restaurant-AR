import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

function ensureCloudinaryConfig() {
  if (isCloudinaryConfigured) return;

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
    const error = new Error('Cloudinary chưa được cấu hình. Vui lòng thiết lập CLOUDINARY_URL hoặc bộ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    error.status = 500;
    throw error;
  }

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  isCloudinaryConfigured = true;
}

export async function uploadRawBufferToCloudinary({ buffer, originalFilename, folder }) {
  ensureCloudinaryConfig();

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        type: 'upload',
        access_mode: 'public',
        access_control: [{ access_type: 'anonymous' }],
        folder,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        filename_override: originalFilename,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

  const deliveryUrl = cloudinary.url(uploadResult.public_id, {
    resource_type: 'raw',
    type: 'upload',
    secure: true,
    version: uploadResult.version,
  });

  const signedUrl = cloudinary.url(uploadResult.public_id, {
    resource_type: 'raw',
    type: 'upload',
    secure: true,
    sign_url: true,
    version: uploadResult.version,
  });

  return {
    ...uploadResult,
    delivery_url: deliveryUrl,
    signed_url: signedUrl,
  };
}
