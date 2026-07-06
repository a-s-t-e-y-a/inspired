import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Inquiry extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  medicalCondition?: string;

  @Prop()
  documentUrl?: string;

  @Prop({ required: true, enum: ['contact_form', 'need_help'] })
  source: string;

  @Prop({ default: false })
  isArchived: boolean;
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);
