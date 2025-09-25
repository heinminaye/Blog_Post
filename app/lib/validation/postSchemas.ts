// lib/validations/postSchemas.ts
import customJoi from '@/lib/customJoi';
import { contentBlockTypes, embedTypes, PostCreateInput } from '@/types/post';

export const ContentBlockSchema = customJoi.object({
  type: customJoi.string().valid(...contentBlockTypes).required().label('Content block type'),
  content: customJoi.when('type', {
    is: customJoi.valid('paragraph', 'quote', 'code', 'heading'),
    then: customJoi.string().required().label('Content'),
    otherwise: customJoi.string().allow('').optional()
  }),
  url: customJoi.when('type', {
    is: customJoi.valid('image', 'video', 'embed'),
    then: customJoi.string().uri().required().label('URL'),
    otherwise: customJoi.string().optional()
  }),
  publicId: customJoi.when('type', {
    is: 'image',
    then: customJoi.string().required().label('Public ID'),
    otherwise: customJoi.forbidden()
  }),
  altText: customJoi.string().optional().label('Alt text'),
  caption: customJoi.string().optional().label('Caption'),
  width: customJoi.number().positive().optional().label('Width'),
  height: customJoi.number().positive().optional().label('Height'),
  language: customJoi.when('type', {
    is: 'code',
    then: customJoi.string().required().label('Language'),
    otherwise: customJoi.string().optional()
  }),
  embedType: customJoi.when('type', {
    is: 'embed',
    then: customJoi.string().valid(...embedTypes).required().label('Embed type'),
    otherwise: customJoi.string().optional()
  })
});

export const PostCreateSchema = customJoi.object<PostCreateInput>({
  title: customJoi.string().max(120).required().label('Title'),
  slug: customJoi.string().pattern(/^[a-z0-9-]+$/).required().label('Slug'),
  content: customJoi.array().items(ContentBlockSchema).min(1).required().label('Content'),
  excerpt: customJoi.string().max(300).optional().label('Excerpt'),
  coverImage: customJoi.string().uri().optional().label('Cover image'),
  tags: customJoi.array().items(customJoi.string().max(25).lowercase()).optional().label('Tags'),
  published: customJoi.boolean().default(false).label('Published')
}).options({ abortEarly: false });

export const PostUpdateSchema = customJoi.object({
  title: customJoi.string().max(120).optional().label('Title'),
  slug: customJoi.string().pattern(/^[a-z0-9-]+$/).optional().label('Slug'),
  content: customJoi.array().items(ContentBlockSchema).min(1).optional().label('Content'),
  excerpt: customJoi.string().max(300).optional().label('Excerpt'),
  coverImage: customJoi.string().uri().optional().label('Cover image'),
  tags: customJoi.array().items(customJoi.string().max(25).lowercase()).optional().label('Tags'),
  published: customJoi.boolean().optional().label('Published')
}).options({ abortEarly: false });