import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthTestController } from './auth-test.controller';
import { PatientsModule } from '../patients/patients.module';
import { AdminsModule } from '../admins/admins.module';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { PatientGuard, AdminGuard, AuthenticatedGuard } from './guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
    PatientsModule,
    AdminsModule,
    JwtModule.register({}),
  ],
  providers: [
    CryptoService,
    AuthService,
    PatientGuard,
    AdminGuard,
    AuthenticatedGuard,
  ],
  controllers: [AuthController, AuthTestController],
  exports: [CryptoService, AuthService, JwtModule, AdminGuard, PatientGuard, AuthenticatedGuard],
})
export class AuthModule {}
