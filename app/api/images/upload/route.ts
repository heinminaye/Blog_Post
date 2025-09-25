import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { apiErrorResponse, apiSuccessResponse, formatValidationError } from '@/lib/utils';
import { UploadSchema } from '@/lib/validation/uploadSchemas';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

interface ImageUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getCurrentUser(request);
    if (!user) {
      return apiErrorResponse('Unauthorized', 'Authentication required', 401);
    }

    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    // Validation
    if (!image) {
      return apiErrorResponse(
        'Validation failed',
        'Image is required',
        400,
        [{ field: 'image', message: 'Image is required' }]
      );
    }

    // Create validation object with flat structure
    const validationData = {
      name: image.name,
      type: image.type,
      size: image.size
    };

    const { error } = UploadSchema.validate(validationData);

    if (error) {
      return apiErrorResponse(
        'Validation failed',
        'Invalid image upload',
        400,
        formatValidationError(error)
      );
    }

    const buffer = await image.arrayBuffer();
    const result = await new Promise<ImageUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `drafts/${user.id}`,
          public_id: `${Date.now()}`,
          resource_type: 'auto',
          tags: ['draft', `user-${user.id}`],
          context: {
            alt: image.name,
            caption: 'Draft image'
          }
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      ).end(Buffer.from(buffer));
    });

    return apiSuccessResponse(result);

  } catch (error) {
    console.error('Upload error:', error);
    return apiErrorResponse(
      'Upload failed',
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
}