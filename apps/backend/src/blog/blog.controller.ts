import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dtos/blog.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Blog')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve blog posts with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of blog posts.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.blogService.findAll(false, Number(page) || 1, Number(limit) || 10, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific blog post by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Blog post details.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  async findOne(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Patch(':id/archive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a blog post (Soft Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Blog post archived successfully.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  async archive(@Param('id') id: string) {
    return this.blogService.archive(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a blog post (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
