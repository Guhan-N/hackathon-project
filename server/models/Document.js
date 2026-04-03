const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Document'
  },
  content: {
    type: Buffer, // Store Yjs binary updates (blob)
    default: () => Buffer.alloc(0)
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false // Don't return the password in standard queries
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
