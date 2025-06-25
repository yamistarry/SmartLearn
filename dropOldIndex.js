const mongoose = require('mongoose');

async function dropOldParticipantsIndex() {
  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection('conversations').indexes();
    console.log('Current indexes:', indexes);

    // Drop the old unique index on participants field (usually named 'participants_1')
    await db.collection('conversations').dropIndex('participants_1');
    console.log('✅ Dropped old unique index on participants.');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('ℹ️ Old index on participants not found, nothing to drop.');
    } else {
      console.error('❌ Error dropping old index:', error);
    }
  }
}

mongoose.connect('mongodb+srv://sainishivani060905:shivani123@cluster0.aez4f.mongodb.net/Smartlearn?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Database connected');
    await dropOldParticipantsIndex();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });
