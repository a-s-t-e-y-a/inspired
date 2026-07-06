import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly iterations = 100000;
  private readonly keylen = 64;
  private readonly digest = 'sha512';

  /**
   * Hashes a plain-text password using PBKDF2
   */
  hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, this.iterations, this.keylen, this.digest)
      .toString('hex');
    return { hash, salt };
  }

  /**
   * Verifies a plain-text password against a stored PBKDF2 hash and salt
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, this.iterations, this.keylen, this.digest)
      .toString('hex');
    return hash === verifyHash;
  }

  /**
   * Securely hashes a token (e.g. Refresh Token) using SHA-256 before database storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a secure random token (e.g. for Refresh Tokens)
   */
  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
