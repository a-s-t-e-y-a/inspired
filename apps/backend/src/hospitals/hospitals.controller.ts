import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto, UpdateHospitalDto } from './dtos/hospital.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) { }

  @Get()
  @ApiOperation({ summary: 'Retrieve active hospitals with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of hospitals.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hospitalsService.findAll(false, Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific hospital by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Hospital details.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  async findOne(@Param('id') id: string) {
    return this.hospitalsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hospital (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Hospital created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(createHospitalDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a hospital (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Hospital updated successfully.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  async update(@Param('id') id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
    return this.hospitalsService.update(id, updateHospitalDto);
  }

  @Patch(':id/archive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a hospital (Soft Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Hospital archived successfully.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  async archive(@Param('id') id: string) {
    return this.hospitalsService.archive(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a hospital (Hard Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Hospital deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Hospital not found.' })
  async remove(@Param('id') id: string) {
    return this.hospitalsService.remove(id);
  }
}
