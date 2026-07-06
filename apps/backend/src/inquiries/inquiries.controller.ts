import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { AdminGuard } from '../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) { }

  @Post()
  @ApiOperation({ summary: 'Submit a new inquiry (Public endpoint)' })
  @ApiResponse({ status: 201, description: 'The inquiry has been successfully created.' })
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all inquiries (Protected)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of inquiries' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.inquiriesService.findAll(+page, +limit);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive an inquiry (Protected)' })
  @ApiResponse({ status: 200, description: 'The inquiry has been archived.' })
  archive(@Param('id') id: string) {
    return this.inquiriesService.archive(id);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inquiry (Protected)' })
  @ApiResponse({ status: 200, description: 'The inquiry has been deleted.' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
