import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  house: {
    type: String,
    enum: ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin', ''], // Empty string for not sorted yet
    default: ''
  },
  avatarUrl: { // This will store the URL from Cloudinary
    type: String,
    default: 'https://placehold.co/100x100/aabbcc/ffffff?text=User' // Default placeholder image
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  favoriteSpell: {
    type: String,
    required: false
  },
  wandCore: {
    type: String,
    required: false
  },
  petCompanion: {
    type: String,
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

export default mongoose.model('User', userSchema);
