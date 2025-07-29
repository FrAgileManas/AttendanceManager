import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
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

// Update the updatedAt field before saving
memberSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Create index on name for faster queries
memberSchema.index({ name: 1 })

export default mongoose.models.Member || mongoose.model('Member', memberSchema)