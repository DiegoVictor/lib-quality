import { model, Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  count: number;
  full_name: string;
}

export const Repository = model<IRepository>(
  'Repository',
  new Schema(
    {
      full_name: String,
      count: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    { timestamps: true },
  ),
);
