import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    enum: ['Java', 'Python', 'Data Science', 'Cloud', 'QA', 'HR', 'Electrical', 'JavaScript', 'React', 'Node.js', 'System Design']
  },
  questions: [{
    questionId: String,
    questionText: String,
    category: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    }
  }],
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalScore: {
    type: Number,
    default: 0
  }
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
