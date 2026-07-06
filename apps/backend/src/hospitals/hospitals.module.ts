import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { Hospital, HospitalSchema } from './schemas/hospital.schema';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use AdminGuard

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }]),
    AuthModule,
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule { }
