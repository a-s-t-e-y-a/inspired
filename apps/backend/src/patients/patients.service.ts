import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  async create(
    name: string,
    email: string,
    passwordHash: string,
    salt: string,
  ): Promise<PatientDocument> {
    const newPatient = new this.patientModel({
      name,
      email,
      passwordHash,
      salt,
    });
    return newPatient.save();
  }

  async findByEmail(email: string): Promise<PatientDocument | null> {
    return this.patientModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<PatientDocument | null> {
    return this.patientModel.findById(id).exec();
  }

  /**
   * Updates extensive session audit metadata upon successful login
   */
  async updateLoginAudit(
    id: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.patientModel
      .findByIdAndUpdate(id, {
        $set: {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          lastLoginUserAgent: userAgent,
        },
      })
      .exec();
  }
}
