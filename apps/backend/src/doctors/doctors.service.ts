import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto, UpdateDoctorDto } from './dtos/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const createdDoctor = new this.doctorModel(createDoctorDto);
    return createdDoctor.save();
  }

  async findAll(
    includeArchived: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Doctor[]; total: number; page: number; totalPages: number }> {
    const filter = includeArchived ? {} : { isArchived: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.doctorModel.find(filter).skip(skip).limit(limit).populate('hospitalAffiliation').exec(),
      this.doctorModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).populate('hospitalAffiliation').exec();
    if (!doctor || doctor.isArchived) {
      throw new NotFoundException(`Doctor with ID ${id} not found or is archived`);
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const updatedDoctor = await this.doctorModel
      .findByIdAndUpdate(id, updateDoctorDto, { new: true })
      .populate('hospitalAffiliation')
      .exec();
    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return updatedDoctor;
  }

  async archive(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }
}
