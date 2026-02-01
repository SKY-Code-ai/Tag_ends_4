import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  strengths: [{
    type: String
  }],
  gaps: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  overallFeedback: {
    type: String,
    default: ''
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
