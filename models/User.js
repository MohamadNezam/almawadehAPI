const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  registerDate: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpires:{
    type: Date
  },
  verified :{
    type: Boolean,
    default: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'role'
  },
});

module.exports = mongoose.model('user', userSchema);
