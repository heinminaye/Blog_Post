import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const publicId = decodeURIComponent(params.publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'not found') {
      return apiErrorResponse(
        'Image not found',
        'The specified image was not found',
        404
      );
    }

    return apiSuccessResponse({
      success: true,
      publicId,
      result: result.result
    });
    
  } catch (error: unknown) {
    console.error('Deletion failed:', error);
    return apiErrorResponse(
      'Deletion failed',
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
}
