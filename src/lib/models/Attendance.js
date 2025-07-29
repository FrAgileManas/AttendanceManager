import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    set: function(v) {
      // Ensure date is stored at start of day (UTC)
      if (v instanceof Date) {
        return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
      }
      return v;
    }
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: [true, 'Status is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Indexes for efficient queries
attendanceSchema.index({ memberId: 1 })
attendanceSchema.index({ date: 1 })
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true }) // Compound unique index

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema)