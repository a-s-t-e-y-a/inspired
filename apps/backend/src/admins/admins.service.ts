import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) { }

  async create(
    name: string,
    email: string,
    passwordHash: string,
    salt: string,
  ): Promise<AdminDocument> {
    const newAdmin = new this.adminModel({
      name,
      email,
      passwordHash,
      salt,
    });
    return newAdmin.save();
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<AdminDocument | null> {
    return this.adminModel.findById(id).exec();
  }

  async findAll(): Promise<any[]> {
    return this.adminModel
      .find()
      .select('-passwordHash -salt')
      .lean()
      .exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.adminModel.findByIdAndDelete(id).exec();
  }

  /**
   * Updates session audit metadata upon successful Admin login
   */
  async updateLoginAudit(
    id: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.adminModel
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
