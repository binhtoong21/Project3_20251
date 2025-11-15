import app from './app.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    server.close(async () => {
      await mongoose.disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    });
  });
}

startServer();
  