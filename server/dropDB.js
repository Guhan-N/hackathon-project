const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/collaborative-editor';

async function drop() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await mongoose.connection.db.dropCollection('documents');
    console.log('Dropped collection "documents"');
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      console.log('Collection already empty or not found');
    } else {
      console.error('Error dropping collection:', err);
    }
  } finally {
    process.exit(0);
  }
}

drop();
