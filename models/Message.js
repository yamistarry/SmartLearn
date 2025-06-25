const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length === 2;
      },
      message: 'Participants must be exactly two users',
    },
  },
  participantsKey: {
    type: String,
    required: true,
  },
  messages: [
    {
      from: { type: String, required: true },
      to: { type: String, required: true },
      // content: { type: String, required: true },
      content: { type: String, required: true }, // text, URL, or base64 string
   type: { type: String, enum: ['text', 'image', 'gif', 'audio', 'video', 'file'] },

      timestamp: { type: Date, default: Date.now },
      delivered: { type: Boolean, default: false },  // <-- new field
      read: { type: Boolean, default: false },
    },
  ],
  unreadCounts: {
    type: Map,
    of: Number,
    default: () => new Map(),

  },
});

// Ensure unique index on participantsKey
conversationSchema.index({ participantsKey: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
