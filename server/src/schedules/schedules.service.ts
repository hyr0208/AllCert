import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(month?: string) {
    let where = {};

    if (month) {
      // month format: "2026-01"
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      where = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    return this.prisma.examSchedule.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        certification: true,
      },
    });
  }

  async findByCertification(certificationId: string) {
    return this.prisma.examSchedule.findMany({
      where: { certificationId },
      orderBy: { date: 'asc' },
    });
  }

  async create(data: CreateScheduleDto) {
    return this.prisma.examSchedule.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async update(id: number, data: UpdateScheduleDto) {
    return this.prisma.examSchedule.update({
      where: { id },
      data: data.date ? { ...data, date: new Date(data.date) } : data,
    });
  }

  async remove(id: number) {
    return this.prisma.examSchedule.delete({ where: { id } });
  }
}
