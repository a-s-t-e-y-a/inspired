import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientsModule } from './patients/patients.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { DoctorsModule } from './doctors/doctors.module';
import { RoomsModule } from './rooms/rooms.module';
import { MedicalConditionsModule } from './medical-conditions/medical-conditions.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { UploadModule } from './upload/upload.module';
import { AdminManagementModule } from './admin-management/admin-management.module';
import { BlogModule } from './blog/blog.module';
import { ENV } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ENV],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: ENV.MONGO_URI,
      }),
    }),
    PatientsModule,
    AdminsModule,
    AuthModule,
    HospitalsModule,
    DoctorsModule,
    RoomsModule,
    MedicalConditionsModule,
    InquiriesModule,
    UploadModule,
    AdminManagementModule,
    BlogModule,
  ],
})
export class AppModule { }
