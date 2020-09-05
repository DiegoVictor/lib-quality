import { model, Schema, Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
}

export default model<User>(
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
