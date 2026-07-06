import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dtos/doctor.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve active doctors with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of doctors.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.doctorsService.findAll(false, Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific doctor by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Doctor details.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new doctor (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a doctor (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Patch(':id/archive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a doctor (Soft Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Doctor archived successfully.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async archive(@Param('id') id: string) {
    return this.doctorsService.archive(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a doctor (Hard Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
