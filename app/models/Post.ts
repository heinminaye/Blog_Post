import mongoose, { Schema } from 'mongoose';
import { 
  IContentBlock, 
  IPost, 
  ContentBlockType,
  contentBlockTypes, 
  embedTypes 
} from '@/types/post';

const requireFieldFor = <T>(field: keyof IContentBlock, types: ContentBlockType[]) => {
  return function(this: T) {
    return types.includes((this as unknown as IContentBlock).type);
  };
};

const ContentBlockSchema = new Schema<IContentBlock>(
  {
    type: { 
      type: String, 
      required: true,
      enum: contentBlockTypes
    },
    content: { 
      type: String,
      required: requireFieldFor<IContentBlock>('content', [
        'paragraph', 'quote', 'code','heading'
      ])
    },
    url: { 
      type: String,
      required: requireFieldFor<IContentBlock>('url', ['image', 'video', 'embed']),
      match: /^https?:\/\//i
    },
    publicId: { 
      type: String,
      required: requireFieldFor<IContentBlock>('publicId', ['image'])
    },
    altText: { type: String },
    caption: { type: String },
    width: { type: Number },
    height: { type: Number },
    language: { 
      type: String,
      required: requireFieldFor<IContentBlock>('language', ['code'])
    },
    author: { type: String },
    embedType: { 
      type: String,
      enum: embedTypes,
      required: requireFieldFor<IContentBlock>('embedType', ['embed'])
    }
  },
  { 
    _id: false,
    toJSON: {
      transform: (doc, ret: Record<string, unknown>) => {
        Object.keys(ret).forEach(key => ret[key] == null && delete ret[key]);
        return ret;
      }
    }
  }
);

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
    content: { type: [ContentBlockSchema], required: true },
    excerpt: { type: String, maxlength: 300 },
    coverImage: { type: String, match: /^https?:\/\//i },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    tags: [{ type: String, maxlength: 25, lowercase: true }],
    readingTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

PostSchema.pre<IPost>('save', function(next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (!this.excerpt && this.content?.length > 0) {
    const firstTextBlock = this.content.find(b => 
      ['paragraph', 'heading'].includes(b.type)
    );
    this.excerpt = firstTextBlock?.content?.substring(0, 300).trim() || '';
  }

  if (this.isModified('content')) {
    const wordCount = this.content.reduce((total, block) => 
      total + (block.content?.split(/\s+/).length || 0), 0);
    this.readingTime = Math.ceil(wordCount / 265);
  }

  next();
});

PostSchema.index({ author: 1, publishedAt: -1 });
PostSchema.index({ tags: 1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);