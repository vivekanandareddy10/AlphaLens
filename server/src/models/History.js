import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  }
});

export const History = mongoose.model('History', historySchema);
