import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  salt: string;

  // Extensive session audit metadata
  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  lastLoginIp: string;

  @Prop({ default: null })
  lastLoginUserAgent: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
