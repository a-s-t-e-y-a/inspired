import { Controller, Post, Body, Req, Res, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  PatientSignupDto,
  PatientLoginDto,
  AdminSignupDto,
  AdminLoginDto,
  RefreshTokenDto,
} from './dtos/auth.dto';
import { ENV } from '../config/env.config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('patient/signup')
  @ApiOperation({ summary: 'Register a new patient account' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully.' })
  @ApiResponse({ status: 409, description: 'Email address already registered.' })
  async patientSignup(@Body() body: PatientSignupDto) {
    return this.authService.signupPatient(body.name, body.email, body.passwordHash);
  }

  @Post('patient/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in as a patient' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated, returns JWT token pair.' })
  @ApiResponse({ status: 401, description: 'Invalid login credentials.' })
  async patientLogin(
    @Body() body: PatientLoginDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    return this.authService.loginPatient(body.email, body.passwordHash, ip, userAgent);
  }

  @Post('admin/signup')
  @ApiOperation({ summary: 'Register a new administrator account' })
  @ApiResponse({ status: 201, description: 'Administrator registered successfully.' })
  @ApiResponse({ status: 403, description: 'Admin signup is currently disabled.' })
  @ApiResponse({ status: 409, description: 'Email address already registered.' })
  async adminSignup(@Body() body: AdminSignupDto) {
    if (!ENV.ALLOW_ADMIN_SIGNUP) {
      throw new ForbiddenException(
        'Admin self-signup is disabled. Contact an existing admin to create your account.',
      );
    }
    return this.authService.signupAdmin(body.name, body.email, body.passwordHash);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in as an administrator' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated, sets httpOnly cookies.' })
  @ApiResponse({ status: 401, description: 'Invalid login credentials.' })
  async adminLogin(
    @Body() body: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    const tokens = await this.authService.loginAdmin(body.email, body.passwordHash, ip, userAgent);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and refresh active session tokens' })
  @ApiResponse({ status: 200, description: 'Returns a fresh rotated Access and Refresh token pair.' })
  @ApiResponse({ status: 401, description: 'Invalid or compromised refresh session.' })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    // Read refreshToken from cookie first, fallback to body
    const refreshTokenVal = req.cookies?.refreshToken || body.refreshToken;
    const tokens = await this.authService.refreshTokens(refreshTokenVal, ip, userAgent);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out and invalidate session refresh token' })
  @ApiResponse({ status: 204, description: 'Session revoked successfully.' })
  async logout(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Read refreshToken from cookie first, fallback to body
    const refreshTokenVal = req.cookies?.refreshToken || body.refreshToken;
    if (refreshTokenVal) {
      await this.authService.logout(refreshTokenVal);
    }
    // Clear both cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}
