import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto, UpdateRoomDto } from './dtos/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const createdRoom = new this.roomModel(createRoomDto);
    return createdRoom.save();
  }

  async findAll(
    includeArchived: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Room[]; total: number; page: number; totalPages: number }> {
    const filter = includeArchived ? {} : { isArchived: false };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.roomModel.find(filter).skip(skip).limit(limit).exec(),
      this.roomModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Room> {
    const room = await this.roomModel.findById(id).exec();
    if (!room || room.isArchived) {
      throw new NotFoundException(`Room with ID ${id} not found or is archived`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true })
      .exec();
    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return updatedRoom;
  }

  async archive(id: string): Promise<Room> {
    const room = await this.roomModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async remove(id: string): Promise<void> {
    const result = await this.roomModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }
}
