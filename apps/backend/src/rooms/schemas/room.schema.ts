import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ _id: false })
export class Address {
  @Prop() streetAddress: string;
  @Prop() addressLocality: string;
  @Prop() addressRegion: string;
  @Prop() postalCode: string;
  @Prop() addressCountry: string;
}

@Schema({ _id: false })
export class GeoLocation {
  @Prop({
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  })
  type: string;

  @Prop({
    type: [Number],
    required: true,
    // Note: coordinates should be [longitude, latitude]
  })
  coordinates: number[];
}

@Schema({ _id: false })
export class SeoMetadata {
  @Prop() metaTitle: string;
  @Prop() metaDescription: string;
  @Prop([String]) keywords: string[];
}

@Schema({ timestamps: true })
export class Room {
  // Basic Info
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop() accommodationCategory: string; // e.g. "Suite", "Standard", "Single"

  // Room Specifications
  @Prop([String]) bed: string[];
  @Prop() occupancy: number;
  @Prop() floorLevel: string;
  @Prop() floorSize: number; // in square meters/feet
  @Prop() numberOfRooms: number;
  @Prop() numberOfBathroomsTotal: number;

  // Amenities
  @Prop([String]) amenityFeature: string[];
  @Prop({ default: false }) petsAllowed: boolean;

  // Booking & Pricing
  @Prop({ required: true }) perNightPrice: number;
  @Prop({ default: true }) inStock: boolean;
  @Prop() tourBookingPage: string;

  // Location
  @Prop({ type: Address }) address: Address;
  
  @Prop({ type: GeoLocation, index: '2dsphere' })
  geo: GeoLocation;

  // Media
  @Prop({
    type: [String],
    validate: [
      (val: string[]) => val.length >= 5 && val.length <= 20,
      '{PATH} must have between 5 and 20 images'
    ]
  })
  image: string[];

  // State Management
  @Prop({ default: false }) isArchived: boolean;

  // SEO
  @Prop({ type: SeoMetadata }) seo: SeoMetadata;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
