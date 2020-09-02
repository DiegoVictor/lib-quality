import { model, Schema } from 'mongoose';

export default model(
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
