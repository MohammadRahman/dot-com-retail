/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import slugify from 'slugify';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

export function generateSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true, // removes special chars
    trim: true,
  });
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// export async function uploadToCloudinary(
//   filePath: string,
//   folder = 'products',
// ): Promise<string> {
//   console.log('CLOUDINARY CONFIG:', {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
//   });
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder,
//       resource_type: 'auto', // auto-detect image/video
//     });
//     return result.secure_url;
//   } catch (error) {
//     throw new Error(`Cloudinary upload failed: ${error.message}`);
//   }
// }

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder = 'products',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(
            new Error(
              'Cloudinary upload failed: No result or secure_url returned.',
            ),
          );
        }
      },
    );
    upload.end(file.buffer);
  });
}
