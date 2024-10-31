import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './schemas/booking.schema';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { EmailService } from 'src/email/email.service';
import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  async findAll(id: string): Promise<Booking[]> {
    return await this.bookingModel.find({
      user: new Types.ObjectId(id),
      status: { $ne: 'pending' },
    });
  }

  async findPendings(id: string): Promise<Booking[]> {
    return await this.bookingModel.find({
      user: new Types.ObjectId(id),
      status: 'pending',
    });
  }

  async registerAttendance(createBookingDto: CreateBookingDto): Promise<any[]> {
    const startDate = new Date(createBookingDto.startDate);

    return await this.bookingModel
      .find({ startDate, status: 'pending' })
      .populate('user');
  }

  async history(createBookingDto: CreateBookingDto): Promise<any[]> {
    const startDate = new Date(createBookingDto.startDate);

    return await this.bookingModel.find({ startDate }).populate('user');
  }

  async verify(id: string, createBookingDto: CreateBookingDto): Promise<any> {
    const startDate = new Date(createBookingDto.startDate);
    const cupoDisponible = 30;

    const count = await this.bookingModel.countDocuments({
      startDate,
      status: { $ne: 'cancelled' },
    });

    const user = await this.userModel.findById(id);

    if (!user.personalId || user.personalId === '') {
      return {
        verify: false,
        message:
          'No has actualizado tu ID de estudiante. Ve a la opción Perfil.',
      };
    }

    const booking = await this.bookingModel.findOne({
      user: new Types.ObjectId(id),
      startDate,
      status: { $ne: 'cancelled' },
    });

    if (booking) {
      return {
        verify: false,
        message: 'Ya tienes una reserva para esta fecha y hora',
      };
    }

    return {
      verify: count < cupoDisponible,
      message:
        count < cupoDisponible
          ? `Quedan ${cupoDisponible - count} cupos disponibles`
          : 'No hay cupos disponibles para esta fecha',
    };
  }

  async attended(id: string): Promise<Booking> {
    return await this.bookingModel.findByIdAndUpdate(
      id,
      {
        status: 'confirmed',
      },
      {
        new: true,
        returnDocument: 'after',
      },
    );
  }

  async noAttended(id: string): Promise<Booking> {
    return await this.bookingModel.findByIdAndUpdate(
      id,
      {
        status: 'noConfirmed',
      },
      {
        new: true,
        returnDocument: 'after',
      },
    );
  }

  async historyByUser(id: string): Promise<Booking[]> {
    return await this.bookingModel.find({
      user: new Types.ObjectId(id),
    });
  }

  async cancel(id: string): Promise<Booking> {
    return await this.bookingModel.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
      },
      {
        new: true,
        returnDocument: 'after',
      },
    );
  }

  async create(
    id: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const newEndDate = new Date(createBookingDto.startDate);
    newEndDate.setHours(newEndDate.getHours() + 1);

    const user = await this.userModel.findById(id);

    const newBooking = new this.bookingModel({
      startDate: new Date(createBookingDto.startDate),
      endDate: newEndDate,
      user: new Types.ObjectId(id),
    });

    const startDate = new Date(createBookingDto.startDate);

    const formattedStartDate = formatInTimeZone(
      startDate,
      'America/Bogota',
      "EEEE, dd 'de' MMMM 'del' yyyy 'a las' hh:mm a",
      { locale: es },
    );

    await this.emailService.sendEmail(
      user.email,
      'Has realizado una reserva',
      'booking-done.hbs',
      { name: user.name, fecha: formattedStartDate },
    );

    return await newBooking.save();
  }
}
