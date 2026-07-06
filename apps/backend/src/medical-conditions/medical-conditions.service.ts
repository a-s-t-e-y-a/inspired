import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalCondition, MedicalConditionDocument } from './schemas/medical-condition.schema';
import { CreateMedicalConditionDto, UpdateMedicalConditionDto } from './dtos/medical-condition.dto';

@Injectable()
export class MedicalConditionsService {
  constructor(
    @InjectModel(MedicalCondition.name) private readonly conditionModel: Model<MedicalConditionDocument>,
  ) {}

  async create(createDto: CreateMedicalConditionDto): Promise<MedicalCondition> {
    const createdCondition = new this.conditionModel(createDto);
    return createdCondition.save();
  }

  async findAll(
    includeArchived: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: MedicalCondition[]; total: number; page: number; totalPages: number }> {
    const filter = includeArchived ? {} : { isArchived: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.conditionModel.find(filter).skip(skip).limit(limit).exec(),
      this.conditionModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MedicalCondition> {
    const condition = await this.conditionModel.findById(id).exec();
    if (!condition || condition.isArchived) {
      throw new NotFoundException(`Medical Condition with ID ${id} not found or is archived`);
    }
    return condition;
  }

  async update(id: string, updateDto: UpdateMedicalConditionDto): Promise<MedicalCondition> {
    const updatedCondition = await this.conditionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updatedCondition) {
      throw new NotFoundException(`Medical Condition with ID ${id} not found`);
    }
    return updatedCondition;
  }

  async archive(id: string): Promise<MedicalCondition> {
    const condition = await this.conditionModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!condition) {
      throw new NotFoundException(`Medical Condition with ID ${id} not found`);
    }
    return condition;
  }

  async remove(id: string): Promise<void> {
    const result = await this.conditionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Medical Condition with ID ${id} not found`);
    }
  }
}
