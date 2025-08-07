import mongoose from 'mongoose';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});


afterAll(async () => {
  await mongoose.connection.close();
});
