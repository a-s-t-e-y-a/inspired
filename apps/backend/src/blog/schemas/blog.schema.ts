import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ _id: false })
export class BlogSeoMetadata {
  @Prop() metaTitle: string;
  @Prop() metaDescription: string;
  @Prop([String]) keywords: string[];
  @Prop() ogTitle: string;
  @Prop() ogDescription: string;
  @Prop() ogImage: string;
  @Prop() canonicalUrl: string;
  @Prop() focusKeyword: string;
}

@Schema({ timestamps: true })
export class Blog {
  // Basic Info
  @Prop({ required: true }) title: string;
  @Prop({ unique: true }) slug: string;
  @Prop() excerpt: string;

  // Rich HTML content from WYSIWYG editor (may contain inline image URLs)
  @Prop({ type: String }) content: string;

  // Featured / cover image (single key/URL)
  @Prop() coverImage: string;

  // Categories & Tags
  @Prop([String]) tags: string[];
  @Prop([String]) categories: string[];

  // Authoring
  @Prop() author: string;

  // Status
  @Prop({ enum: ['draft', 'published'], default: 'draft' }) status: string;
  @Prop() publishedAt: Date;

  // State Management
  @Prop({ default: false }) isArchived: boolean;

  // SEO
  @Prop({ type: BlogSeoMetadata }) seo: BlogSeoMetadata;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// Auto-generate slug from title before saving if not provided
BlogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = (this.title as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});
