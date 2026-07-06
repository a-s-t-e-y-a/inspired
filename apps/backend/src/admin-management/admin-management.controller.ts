import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminsService } from '../admins/admins.service';
import { CryptoService } from '../auth/crypto.service';
import { AdminGuard } from '../auth/guards/auth.guard';

@ApiTags('Admin Management')
@UseGuards(AdminGuard)
@Controller('admins')
export class AdminManagementController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * GET /admins
   * List all admin accounts (sensitive fields excluded)
   */
  @Get()
  @ApiOperation({ summary: 'List all admin users' })
  async findAll() {
    return this.adminsService.findAll();
  }

  /**
   * POST /admins
   * Create a new admin (only callable by an existing logged-in admin)
   */
  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  async createAdmin(
    @Body() body: { name: string; email: string; password: string },
  ) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('name, email, and password are required');
    }
    if (body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const existing = await this.adminsService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('An admin with this email already exists');
    }

    const { hash, salt } = this.cryptoService.hashPassword(body.password);
    const admin = await this.adminsService.create(body.name, body.email, hash, salt);

    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      createdAt: (admin as any).createdAt,
    };
  }

  /**
   * DELETE /admins/:id
   * Delete an admin account
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin user' })
  async deleteAdmin(@Param('id') id: string) {
    const admin = await this.adminsService.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    await this.adminsService.deleteById(id);
    return { message: 'Admin deleted successfully' };
  }
}
