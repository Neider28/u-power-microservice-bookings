import { Controller } from '@nestjs/common';
import { BookingService } from './booking.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingMSG } from 'src/common/constants';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern(BookingMSG.FIND_ALL)
  findAll(@Payload() payload: string) {
    return this.bookingService.findAll(payload);
  }

  @MessagePattern(BookingMSG.FIND_PENDINGS)
  findPendings(@Payload() payload: string) {
    return this.bookingService.findPendings(payload);
  }

  @MessagePattern(BookingMSG.REGISTER_ATTENDANCE)
  registerAttendance(@Payload() payload: any) {
    return this.bookingService.registerAttendance(payload.createBookingDto);
  }

  @MessagePattern(BookingMSG.HISTORY_BY_USER)
  historyByUser(@Payload() payload: any) {
    return this.bookingService.historyByUser(payload);
  }

  @MessagePattern(BookingMSG.HISTORY)
  history(@Payload() payload: any) {
    return this.bookingService.history(payload.createBookingDto);
  }

  @MessagePattern(BookingMSG.VERIFY)
  verify(@Payload() payload: any) {
    return this.bookingService.verify(payload.id, payload.createBookingDto);
  }

  @MessagePattern(BookingMSG.ATTENDED)
  attended(@Payload() payload: any) {
    return this.bookingService.attended(payload);
  }

  @MessagePattern(BookingMSG.NO_ATTENDED)
  noAttended(@Payload() payload: any) {
    return this.bookingService.noAttended(payload);
  }

  @MessagePattern(BookingMSG.CANCEL)
  cancel(@Payload() payload: any) {
    return this.bookingService.cancel(payload);
  }

  @MessagePattern(BookingMSG.CREATE)
  create(@Payload() payload: any) {
    return this.bookingService.create(payload.id, payload.createBookingDto);
  }
}
