import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { CreateHospitalDto, UpdateHospitalDto } from './dtos/hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<HospitalDocument>,
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const createdHospital = new this.hospitalModel(createHospitalDto);
    return createdHospital.save();
  }

  async findAll(
    includeArchived: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Hospital[]; total: number; page: number; totalPages: number }> {
    const filter = includeArchived ? {} : { isArchived: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.hospitalModel.find(filter).skip(skip).limit(limit).exec(),
      this.hospitalModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Hospital> {
    const hospital = await this.hospitalModel.findById(id).exec();
    if (!hospital || hospital.isArchived) {
      throw new NotFoundException(`Hospital with ID ${id} not found or is archived`);
    }
    return hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const updatedHospital = await this.hospitalModel
      .findByIdAndUpdate(id, updateHospitalDto, { new: true })
      .exec();
    if (!updatedHospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return updatedHospital;
  }

  async archive(id: string): Promise<Hospital> {
    const hospital = await this.hospitalModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return hospital;
  }

  async remove(id: string): Promise<void> {
    const result = await this.hospitalModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }
}
