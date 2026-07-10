import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto, UpdateBlogDto } from './dtos/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const blog = new this.blogModel(createBlogDto);
    if (createBlogDto.status === 'published' && !createBlogDto.publishedAt) {
      blog.publishedAt = new Date();
    }
    return blog.save();
  }

  async findAll(
    includeArchived: boolean = false,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ data: Blog[]; total: number; page: number; totalPages: number }> {
    const filter: Record<string, unknown> = includeArchived ? {} : { isArchived: false };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.blogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.blogModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogModel.findOne({ slug, isArchived: false }).exec();
    if (!blog) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    // Auto-set publishedAt if publishing for the first time
    const existing = await this.blogModel.findById(id).exec();
    if (
      existing &&
      updateBlogDto.status === 'published' &&
      existing.status !== 'published' &&
      !updateBlogDto.publishedAt
    ) {
      (updateBlogDto as Record<string, unknown>).publishedAt = new Date();
    }
    const updated = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return updated;
  }

  async archive(id: string): Promise<Blog> {
    const blog = await this.blogModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!blog) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return blog;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
  }
}
