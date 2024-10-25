import { IsDate, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsDate()
  readonly startDate: Date;
}
