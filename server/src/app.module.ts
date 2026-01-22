import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CertificationsModule } from './certifications/certifications.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [PrismaModule, CertificationsModule, SchedulesModule],
})
export class AppModule {}
