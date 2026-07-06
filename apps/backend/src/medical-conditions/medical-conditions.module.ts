import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalConditionsController } from './medical-conditions.controller';
import { MedicalConditionsService } from './medical-conditions.service';
import { MedicalCondition, MedicalConditionSchema } from './schemas/medical-condition.schema';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use AdminGuard

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MedicalCondition.name, schema: MedicalConditionSchema }]),
    AuthModule,
  ],
  controllers: [MedicalConditionsController],
  providers: [MedicalConditionsService],
  exports: [MedicalConditionsService],
})
export class MedicalConditionsModule {}
