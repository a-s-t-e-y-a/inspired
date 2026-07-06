import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicalConditionDocument = MedicalCondition & Document;

@Schema({ _id: false })
export class SeoMetadata {
  @Prop() metaTitle: string;
  @Prop() metaDescription: string;
  @Prop([String]) keywords: string[];
}

@Schema({ timestamps: true })
export class MedicalCondition {
  // Basic Info
  @Prop({ required: true }) name: string;
  @Prop() alternateName: string;
  @Prop() description: string;
  @Prop() disambiguatingDescription: string;
  @Prop() code: string;
  @Prop() url: string;

  // Clinical Details
  @Prop() pathophysiology: string;
  @Prop() epidemiology: string;
  @Prop() expectedPrognosis: string;
  @Prop() naturalProgression: string;

  // Causes & Risks
  @Prop([String]) cause: string[];
  @Prop([String]) riskFactor: string[];

  // Symptoms & Diagnosis
  @Prop([String]) signOrSymptom: string[];
  @Prop([String]) differentialDiagnosis: string[];
  @Prop([String]) typicalTest: string[];
  @Prop([String]) stage: string[];

  // Treatments & Prevention
  @Prop([String]) possibleTreatment: string[];
  @Prop() primaryPrevention: string;
  @Prop() secondaryPrevention: string;
  @Prop([String]) drug: string[];

  // Specialty
  @Prop([String]) relevantSpecialty: string[];

  // Media (0 to 5 images)
  @Prop({
    type: [String],
    validate: [
      (val: string[]) => val.length <= 5,
      '{PATH} exceeds the limit of 5 images'
    ]
  })
  image: string[];

  // State Management
  @Prop({ default: false }) isArchived: boolean;

  // SEO
  @Prop({ type: SeoMetadata }) seo: SeoMetadata;
}

export const MedicalConditionSchema = SchemaFactory.createForClass(MedicalCondition);
