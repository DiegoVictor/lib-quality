import { model, Schema } from 'mongoose';

export const SearchSession = model(
  'SearchSession',
  new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    repositories: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
  }),
);
