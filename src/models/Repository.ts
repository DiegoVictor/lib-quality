import { model, Schema, Document } from 'mongoose';

export interface Repository extends Document {
  count: number;
  fullName: string;
}

export default model<Repository>(
  'Repository',
  new Schema(
    {
      fullName: String,
      count: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    { timestamps: true },
  ),
);
