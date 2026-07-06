import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inquiry } from './schemas/inquiry.schema';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectModel(Inquiry.name) private inquiryModel: Model<Inquiry>,
  ) { }

  async create(createInquiryDto: CreateInquiryDto): Promise<Inquiry> {
    const createdInquiry = new this.inquiryModel(createInquiryDto);
    return createdInquiry.save();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.inquiryModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.inquiryModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async archive(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    return inquiry;
  }

  async remove(id: string): Promise<void> {
    const result = await this.inquiryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Inquiry not found');
    }
  }
}
