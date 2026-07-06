import { ApiProperty } from '@nestjs/swagger';

export class PatientSignupDto {
  @ApiProperty({ example: 'John Doe', description: 'The full name of the patient' })
  name: string;

  @ApiProperty({ example: 'patient@inspired.com', description: 'Unique email address' })
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'Plain-text password which is hashed synchronously' })
  passwordHash: string;
}

export class PatientLoginDto {
  @ApiProperty({ example: 'patient@inspired.com', description: 'Registered patient email' })
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'Plain-text login password' })
  passwordHash: string;
}

export class AdminSignupDto {
  @ApiProperty({ example: 'Admin User', description: 'The full name of the administrator' })
  name: string;

  @ApiProperty({ example: 'admin@inspired.com', description: 'Unique admin email address' })
  email: string;

  @ApiProperty({ example: 'adminSecurePassword123', description: 'Plain-text password which is hashed synchronously' })
  passwordHash: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@inspired.com', description: 'Registered administrator email' })
  email: string;

  @ApiProperty({ example: 'adminSecurePassword123', description: 'Plain-text login password' })
  passwordHash: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'a91fb1737e5c94fa8b1c0953a8', description: 'The plain-text active session refresh token' })
  refreshToken: string;
}
