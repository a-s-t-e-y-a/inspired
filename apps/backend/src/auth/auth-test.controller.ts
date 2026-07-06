import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PatientGuard, AdminGuard, AuthenticatedGuard } from './guards/auth.guard';

@ApiTags('Auth Testing Guards')
@ApiBearerAuth()
@Controller('auth-test')
export class AuthTestController {
  
  @Get('patient-only')
  @UseGuards(PatientGuard)
  @ApiOperation({ summary: 'Access patient-only protected route' })
  @ApiResponse({ status: 200, description: 'Success, user claims returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing/invalid token.' })
  getPatientData(@Req() req: Request) {
    return {
      message: 'Access granted! Authenticated Patient secure channel.',
      user: req['user'],
    };
  }

  @Get('admin-only')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Access admin-only protected route' })
  @ApiResponse({ status: 200, description: 'Success, user claims returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing/invalid token.' })
  getAdminData(@Req() req: Request) {
    return {
      message: 'Access granted! Authenticated Admin secure channel.',
      user: req['user'],
    };
  }

  @Get('any-authenticated')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Access patient/admin shared protected route' })
  @ApiResponse({ status: 200, description: 'Success, user claims returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing/invalid token.' })
  getAuthenticatedData(@Req() req: Request) {
    return {
      message: 'Access granted! Authenticated generic channel.',
      user: req['user'],
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Access public unprotected route' })
  @ApiResponse({ status: 200, description: 'Success, public data returned.' })
  getPublicData() {
    return {
      message: 'Access granted! This is a public channel accessible to anyone.',
    };
  }
}
