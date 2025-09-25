import customJoi from '@/lib/customJoi';

export const UploadSchema = customJoi.object({
  name: customJoi.string()
    .required()
    .label('Image name'),
  type: customJoi.string()
    .valid('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg')
    .required()
    .label('Image type')
    .messages({
      'any.only': 'Only JPEG, PNG, GIF, or WEBP images are allowed'
    }),
  size: customJoi.number()
    .max(10 * 1024 * 1024)
    .required()
    .label('Image size')
    .messages({
      'number.max': 'Image size must be less than 10MB'
    })
}).options({ abortEarly: false });