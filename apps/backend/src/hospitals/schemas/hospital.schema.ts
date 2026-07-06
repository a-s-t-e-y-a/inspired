import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalDocument = Hospital & Document;

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
export class OpeningHours {
  @Prop() dayOfWeek: string;
  @Prop() opens: string;
  @Prop() closes: string;
}

@Schema({ _id: false })
export class SeoMetadata {
  @Prop() metaTitle: string;
  @Prop() metaDescription: string;
  @Prop([String]) keywords: string[];
}

@Schema({ timestamps: true })
export class Hospital {
  // Basic Info
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop() disambiguatingDescription: string;
  @Prop() slogan: string;
  @Prop() url: string;
  @Prop([String]) awards: string[];
  @Prop([String]) alumni: string[];
  @Prop() owner: string; // parentOrganization or owner

  // Contact
  @Prop() telephone: string;
  @Prop() email: string;
  @Prop() faxNumber: string;

  // Location
  @Prop({ type: Address }) address: Address;
  @Prop({ type: GeoCoordinates }) geo: GeoCoordinates;

  // Media
  @Prop() logo: string;
  @Prop({
    type: [String],
    validate: [
      (val: string[]) => val.length >= 5 && val.length <= 15,
      '{PATH} must have between 5 and 15 images'
    ]
  })
  image: string[];

  // Medical Details
  @Prop([String]) medicalSpecialty: string[];
  @Prop([String]) availableService: string[];
  @Prop({ default: true }) isAcceptingNewPatients: boolean;

  // Business Details
  @Prop({ type: [OpeningHours] }) openingHoursSpecification: OpeningHours[];
  @Prop() priceRange: string;

  // State Management
  @Prop({ default: false }) isArchived: boolean;

  // SEO
  @Prop({ type: SeoMetadata }) seo: SeoMetadata;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
