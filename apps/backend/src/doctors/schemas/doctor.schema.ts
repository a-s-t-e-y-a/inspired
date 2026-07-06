import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Hospital } from '../../hospitals/schemas/hospital.schema';

export type DoctorDocument = Doctor & Document;

@Schema({ _id: false })
export class Address {
  @Prop() streetAddress: string;
  @Prop() addressLocality: string;
  @Prop() addressRegion: string;
  @Prop() postalCode: string;
  @Prop() addressCountry: string;
}

@Schema({ _id: false })
export class GeoCoordinates {
  @Prop() latitude: number;
  @Prop() longitude: number;
}

@Schema({ _id: false })
export class SeoMetadata {
  @Prop() metaTitle: string;
  @Prop() metaDescription: string;
  @Prop([String]) keywords: string[];
}

@Schema({ timestamps: true })
export class Doctor {
  // Basic Info
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop() url: string;
  @Prop([String]) occupationalCategory: string[];

  // Professional Details
  @Prop([String]) medicalSpecialty: string[];
  @Prop([String]) availableService: string[];
  @Prop({ default: true }) isAcceptingNewPatients: boolean;
  
  // Identifiers
  @Prop() usNPI: string;

  // Affiliations
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Hospital' }] })
  hospitalAffiliation: Hospital[];

  // Contact
  @Prop() telephone: string;
  @Prop() email: string;
  @Prop() faxNumber: string;

  // Location
  @Prop({ type: Address }) address: Address;
  @Prop({ type: GeoCoordinates }) geo: GeoCoordinates;

  // Media
  @Prop({
    type: [String],
    validate: [
      (val: string[]) => val.length >= 1 && val.length <= 5,
      '{PATH} must have between 1 and 5 images'
    ]
  })
  image: string[];

  // State Management
  @Prop({ default: false }) isArchived: boolean;

  // SEO
  @Prop({ type: SeoMetadata }) seo: SeoMetadata;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
