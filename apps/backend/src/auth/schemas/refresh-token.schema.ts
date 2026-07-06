import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, unique: true, index: true })
  tokenHash: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['patient', 'admin'] })
  userType: 'patient' | 'admin';

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  // Extensive session audit metadata
  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ default: 'Unknown Device' })
  deviceName: string;

  @Prop({ default: Date.now })
  lastUsedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
