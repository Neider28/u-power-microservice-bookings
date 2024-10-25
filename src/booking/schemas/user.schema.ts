import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: false })
  picture: string;

  @Prop({ required: true, unique: false })
  name: string;

  @Prop({ required: false, unique: false, default: '' })
  personalId: string;

  @Prop({
    required: false,
    enum: ['inactive', 'active'],
    default: 'active',
  })
  status: string;

  @Prop({
    required: false,
    enum: ['admin', 'student'],
    default: 'student',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
