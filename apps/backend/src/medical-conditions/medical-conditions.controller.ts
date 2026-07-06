import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalConditionsService } from './medical-conditions.service';
import { CreateMedicalConditionDto, UpdateMedicalConditionDto } from './dtos/medical-condition.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Medical Conditions')
@Controller('medical-conditions')
export class MedicalConditionsController {
  constructor(private readonly medicalConditionsService: MedicalConditionsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve active medical conditions with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of medical conditions.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.medicalConditionsService.findAll(false, Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific medical condition by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Medical condition details.' })
  @ApiResponse({ status: 404, description: 'Medical condition not found.' })
  async findOne(@Param('id') id: string) {
    return this.medicalConditionsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new medical condition (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Medical condition created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createDto: CreateMedicalConditionDto) {
    return this.medicalConditionsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a medical condition (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Medical condition updated successfully.' })
  @ApiResponse({ status: 404, description: 'Medical condition not found.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateMedicalConditionDto) {
    return this.medicalConditionsService.update(id, updateDto);
  }

  @Patch(':id/archive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a medical condition (Soft Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Medical condition archived successfully.' })
  @ApiResponse({ status: 404, description: 'Medical condition not found.' })
  async archive(@Param('id') id: string) {
    return this.medicalConditionsService.archive(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a medical condition (Hard Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Medical condition deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Medical condition not found.' })
  async remove(@Param('id') id: string) {
    return this.medicalConditionsService.remove(id);
  }
}
