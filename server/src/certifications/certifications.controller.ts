import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Controller('api/certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.certificationsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificationsService.findOne(id);
  }

  @Post()
  create(@Body() createCertificationDto: CreateCertificationDto) {
    return this.certificationsService.create(createCertificationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCertificationDto: UpdateCertificationDto,
  ) {
    return this.certificationsService.update(id, updateCertificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificationsService.remove(id);
  }
}
