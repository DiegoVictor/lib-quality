import mongoose from 'mongoose';

const connection = mongoose.connect(
  process.env.MONGO_URL || '',
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
);

export default connection;
