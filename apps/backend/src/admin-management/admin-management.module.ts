import { Module } from '@nestjs/common';
import { AdminManagementController } from './admin-management.controller';
import { AdminsModule } from '../admins/admins.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AdminsModule, AuthModule],
  controllers: [AdminManagementController],
})
export class AdminManagementModule {}
