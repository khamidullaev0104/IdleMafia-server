const mongoose = require('mongoose');
const { MONGO_URL } = require('./constants');

const connectDB = () => {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('MongoDB Connected...');
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('Received stop signal');
    process.exit();
  });
  return mongoose.connection;
};

module.exports = connectDB;
