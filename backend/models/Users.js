const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // ✅ corrected "require" → "required"
    unique: true,
  },
  password: {
    type: String,
    required: true, // ✅ corrected "require" → "required"
  },
  realtimeEnabled: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user', // ✅ default for regular users
  },
}, { timestamps: true }); // optional: adds createdAt and updatedAt
module.exports = mongoose.model('User', UserSchema);
