import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where = category && category !== '전체' ? { category } : {};
    return this.prisma.certification.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.certification.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async create(data: CreateCertificationDto) {
    return this.prisma.certification.create({ data });
  }

  async update(id: string, data: UpdateCertificationDto) {
    return this.prisma.certification.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.certification.delete({ where: { id } });
  }
}
