import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dtos/room.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve active rooms with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of rooms.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.roomsService.findAll(false, Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific room by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Room details.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new room (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a room (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/archive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a room (Soft Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Room archived successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async archive(@Param('id') id: string) {
    return this.roomsService.archive(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete a room (Hard Delete) (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
