import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { IContentBlock } from '@/types/post';
import { 
  apiErrorResponse, 
  apiSuccessResponse 
} from '@/lib/utils';
import { CloudinaryResource, DeleteResult } from '@/types/image';

export async function GET() {
  try {
    await dbConnect();

    const posts = await Post.find();
    const usedUrls = new Set(
      posts.flatMap(post => 
        post.content
          .filter((block: IContentBlock): block is IContentBlock & { type: 'image'; url: string } => 
            block.type === 'image' && !!block.url
          )
          .map((block:IContentBlock) => block.url)
      )
    );

    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'drafts/',
      max_results: 500
    }) as { resources: CloudinaryResource[] };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const unused = resources.filter((img: CloudinaryResource) => {
      const createdAt = new Date(img.created_at);
      return !usedUrls.has(img.secure_url) && createdAt < sevenDaysAgo;
    });

    const BATCH_SIZE = 100;
    const deleteResults: DeleteResult[] = [];
    
    for (let i = 0; i < unused.length; i += BATCH_SIZE) {
      const batch = unused.slice(i, i + BATCH_SIZE);
      const publicIds = batch.map(img => img.public_id);
      
      try {
        const result = await cloudinary.api.delete_resources(publicIds);
        publicIds.forEach(publicId => {
          deleteResults.push({
            public_id: publicId,
            success: result.deleted[publicId] === 'deleted'
          });
        });
      } catch (error: unknown) {
        publicIds.forEach(publicId => {
          deleteResults.push({
            public_id: publicId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        });
      }
    }

    return apiSuccessResponse({
      deleted: deleteResults.filter(r => r.success).length,
      failed: deleteResults.filter(r => !r.success).length,
      total: resources.length,
      details: deleteResults
    });

  } catch (error: unknown) {
    console.error('Cleanup failed:', error);
    return apiErrorResponse(
      'Cleanup failed',
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
}