export class CreateScheduleDto {
  date: string; // YYYY-MM-DD format
  certificationId: string;
  certificationName: string;
  eventType: string;
  round?: string;
  description?: string;
}
