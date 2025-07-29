import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: [true, 'Member ID is required'],
    unique: true, // This automatically creates an index, so we don't need schema.index()
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty'],
    maxlength: [100, 'Name must be less than 100 characters']
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

// Only add index for name, memberId already has unique index
memberSchema.index({ name: 1 })

export default mongoose.models.Member || mongoose.model('Member', memberSchema)