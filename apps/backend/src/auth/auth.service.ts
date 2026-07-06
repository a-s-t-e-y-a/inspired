import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { PatientsService } from '../patients/patients.service';
import { AdminsService } from '../admins/admins.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { ENV } from '../config/env.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly patientsService: PatientsService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /**
   * Registers a new Patient
   */
  async signupPatient(name: string, email: string, password: string) {
    const existing = await this.patientsService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const { hash, salt } = this.cryptoService.hashPassword(password);
    const patient = await this.patientsService.create(name, email, hash, salt);
    
    return { id: patient._id.toString(), name: patient.name, email: patient.email };
  }

  /**
   * Registers a new Admin
   */
  async signupAdmin(name: string, email: string, password: string) {
    const existing = await this.adminsService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const { hash, salt } = this.cryptoService.hashPassword(password);
    const admin = await this.adminsService.create(name, email, hash, salt);
    
    return { id: admin._id.toString(), name: admin.name, email: admin.email };
  }

  /**
   * Authenticates a Patient credentials and issues tokens
   */
  async loginPatient(email: string, password: string, ip: string, userAgent: string) {
    const patient = await this.patientsService.findByEmail(email);
    if (!patient || !this.cryptoService.verifyPassword(password, patient.passwordHash, patient.salt)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update login audit metadata on Patient schema
    await this.patientsService.updateLoginAudit(patient._id.toString(), ip, userAgent);

    return this.issueTokenPair(patient._id.toString(), patient.email, 'patient', ip, userAgent);
  }

  /**
   * Authenticates an Admin credentials and issues tokens
   */
  async loginAdmin(email: string, password: string, ip: string, userAgent: string) {
    const admin = await this.adminsService.findByEmail(email);
    if (!admin || !this.cryptoService.verifyPassword(password, admin.passwordHash, admin.salt)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update login audit metadata on Admin schema
    await this.adminsService.updateLoginAudit(admin._id.toString(), ip, userAgent);

    return this.issueTokenPair(admin._id.toString(), admin.email, 'admin', ip, userAgent);
  }

  /**
   * Processes Refresh Token Rotation (RTR)
   */
  async refreshTokens(refreshTokenVal: string, ip: string, userAgent: string) {
    // Hash the token immediately for secure DB comparison
    const incomingHash = this.cryptoService.hashToken(refreshTokenVal);
    const storedToken = await this.refreshTokenModel.findOne({ tokenHash: incomingHash }).exec();

    if (!storedToken) {
      throw new UnauthorizedException('Session token unrecognized');
    }

    // If the token is already flagged as revoked, it indicates reuse hijacking!
    if (storedToken.isRevoked) {
      // Security measure: Revoke ALL active tokens for this user!
      await this.refreshTokenModel.updateMany({ userId: storedToken.userId }, { $set: { isRevoked: true } }).exec();
      throw new UnauthorizedException('Compromised session flagged. All sessions revoked.');
    }

    // Expiry check
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Revoke the old refresh token
    storedToken.isRevoked = true;
    await storedToken.save();

    // Issue a brand new RTR token pair
    return this.issueTokenPair(
      storedToken.userId,
      storedToken.userType === 'patient' 
        ? (await this.patientsService.findById(storedToken.userId))?.email || ''
        : (await this.adminsService.findById(storedToken.userId))?.email || '',
      storedToken.userType,
      ip,
      userAgent
    );
  }

  /**
   * Logs out a session by revoking the stored refresh token
   */
  async logout(refreshTokenVal: string): Promise<void> {
    const incomingHash = this.cryptoService.hashToken(refreshTokenVal);
    await this.refreshTokenModel.findOneAndUpdate(
      { tokenHash: incomingHash },
      { $set: { isRevoked: true } }
    ).exec();
  }

  /**
   * Internal helper to issue Access & Refresh Token Pairs
   */
  private async issueTokenPair(
    userId: string,
    email: string,
    role: 'patient' | 'admin',
    ip: string,
    userAgent: string,
  ) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      { secret: ENV.JWT_ACCESS_SECRET, expiresIn: ENV.JWT_ACCESS_EXPIRATION as any },
    );

    const rawRefreshToken = this.cryptoService.generateRandomToken();
    const hashedRefreshToken = this.cryptoService.hashToken(rawRefreshToken);

    const refreshTokenExpiry = new Date();
    // Expiry matches 7 days or similar parsed
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    // Save extensively parsed refresh token to database
    await this.refreshTokenModel.create({
      tokenHash: hashedRefreshToken,
      userId,
      userType: role,
      expiresAt: refreshTokenExpiry,
      ipAddress: ip,
      userAgent,
      deviceName: this.getDeviceName(userAgent),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Resolves basic device name mapping from User Agent header
   */
  private getDeviceName(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile Device';
    }
    if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
      return 'Mac Computer';
    }
    if (userAgent.includes('Windows')) {
      return 'Windows Computer';
    }
    if (userAgent.includes('Linux')) {
      return 'Linux Computer';
    }
    return 'Desktop Computer';
  }
}
