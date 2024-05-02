import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
}

export const User = model<IUser>(
  'User',
  new Schema(
    {
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    { timestamps: true },
  ),
);
