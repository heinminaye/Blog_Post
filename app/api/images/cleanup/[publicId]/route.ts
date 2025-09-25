import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await cloudinary.uploader.destroy(decodedPublicId);
    
    if (result.result === 'not found') {
      return apiErrorResponse(
        'Image not found',
        'The specified image was not found',
        404
      );
    }

    return apiSuccessResponse({
      success: true,
      publicId: decodedPublicId,
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