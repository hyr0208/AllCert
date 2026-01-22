export class CreateCertificationDto {
  id: string;
  name: string;
  category: string;
  organization: string;
  website?: string;
  description?: string;
  tags?: string[];
}
