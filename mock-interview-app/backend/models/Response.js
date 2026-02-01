import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  idealAnswer: {
    type: String,
    default: ''
  },
  evaluatedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Response = mongoose.model('Response', responseSchema);

export default Response;
